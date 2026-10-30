<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\Process\Process;
use RuntimeException;

class BackupController extends Controller
{
    private function authorizeITSupport(Request $request): void
    {
        abort_unless(
            $request->user()?->role === 'it_support',
            403,
            'Akses hanya untuk IT Support.'
        );
    }

    private function binary(string $name): string
    {
        $path = match ($name) {
            'dump' => 'C:\\laragon\\bin\\mysql\\mysql-8.0.30-winx64\\bin\\mysqldump.exe',
            'mysql' => 'C:\\laragon\\bin\\mysql\\mysql-8.0.30-winx64\\bin\\mysql.exe',
            default => throw new RuntimeException('Jenis program MySQL tidak dikenal.'),
        };

        if (!file_exists($path)) {
            throw new RuntimeException("Program MySQL tidak ditemukan: {$path}");
        }

        return $path;
    }

    private function databaseConfig(): array
    {
        $config = config('database.connections.mysql');

        if (!$config || empty($config['database'])) {
            throw new RuntimeException('Konfigurasi database MySQL tidak lengkap.');
        }

        return [
            'host' => $config['host'] ?? '127.0.0.1',
            'port' => (string) ($config['port'] ?? 3306),
            'database' => $config['database'],
            'username' => $config['username'] ?? 'root',
            'password' => $config['password'] ?? '',
        ];
    }

    private function runMysql(
        array $command,
        string $password,
        $input = null,
        $output = null
    ): void {
        $environment = array_merge(getenv() ?: [], [
            'MYSQL_PWD' => $password,
        ]);

        $process = new Process($command, base_path(), $environment);
        $process->setTimeout(3600);

        if (is_resource($input)) {
            $process->setInput($input);
        }

        if (is_resource($output)) {
            $process->run(function ($type, $buffer) use ($output) {
                if ($type === Process::OUT) {
                    fwrite($output, $buffer);
                }
            });
        } else {
            $process->run();
        }

        if (!$process->isSuccessful()) {
            throw new RuntimeException(
                $process->getErrorOutput() ?: 'Proses MySQL gagal.'
            );
        }
    }

    private function createBackup(): string
    {
        $db = $this->databaseConfig();

        $directory = storage_path('app/private/database-backups');

        if (!is_dir($directory)) {
            mkdir($directory, 0700, true);
        }

        $filename = 'backup-' . now()->format('Ymd-His') . '-' . uniqid() . '.sql';
        $path = $directory . DIRECTORY_SEPARATOR . $filename;

        $output = fopen($path, 'wb');

        if (!$output) {
            throw new RuntimeException('Tidak dapat membuat file backup.');
        }

        try {
            $this->runMysql([
                $this->binary('dump'),
                '--host=' . $db['host'],
                '--port=' . $db['port'],
                '--user=' . $db['username'],
                '--single-transaction',
                '--quick',
                '--routines',
                '--triggers',
                '--events',
                '--default-character-set=utf8mb4',
                '--no-tablespaces',
                $db['database'],
            ], $db['password'], null, $output);
        } catch (\Throwable $exception) {
            fclose($output);
            @unlink($path);

            throw $exception;
        }

        fclose($output);

        if (!file_exists($path) || filesize($path) === 0) {
            @unlink($path);

            throw new RuntimeException('File backup kosong atau gagal dibuat.');
        }

        return $path;
    }

    public function export(Request $request)
    {
        $this->authorizeITSupport($request);

        try {
            $path = $this->createBackup();

            return response()
                ->download($path, basename($path), [
                    'Content-Type' => 'application/sql',
                ])
                ->deleteFileAfterSend(true);
        } catch (\Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Backup database gagal. Periksa konfigurasi MySQL dan log Laravel.',
            ], 500);
        }
    }

    public function restore(Request $request)
    {
        $this->authorizeITSupport($request);

        $data = $request->validate([
            'backup_file' => [
                'required',
                'file',
                'extensions:sql',
                'max:102400',
            ],
            'password' => ['required', 'string'],
            'confirmation' => ['required', 'accepted'],
        ]);

        if (!Hash::check($data['password'], $request->user()->password)) {
            return response()->json([
                'message' => 'Password akun tidak sesuai.',
            ], 422);
        }

        $uploadedPath = $request->file('backup_file')->getRealPath();

        if (!$uploadedPath || !is_readable($uploadedPath)) {
            return response()->json([
                'message' => 'File backup tidak dapat dibaca.',
            ], 422);
        }

        $db = $this->databaseConfig();
        $automaticBackup = null;
        $input = null;

        try {
            // Cadangkan database sekarang sebelum restore.
            $automaticBackup = $this->createBackup();

            $input = fopen($uploadedPath, 'rb');

            if (!$input) {
                throw new RuntimeException('File SQL tidak dapat dibuka.');
            }

            $this->runMysql([
                $this->binary('mysql'),
                '--host=' . $db['host'],
                '--port=' . $db['port'],
                '--user=' . $db['username'],
                '--default-character-set=utf8mb4',
                $db['database'],
            ], $db['password'], $input, null);

            fclose($input);

            return response()->json([
                'message' => 'Database berhasil dipulihkan. Backup otomatis sebelum restore tersimpan di penyimpanan server.',
            ]);
        } catch (\Throwable $exception) {
            if (is_resource($input)) {
                fclose($input);
            }

            report($exception);

            // Jika restore gagal, coba pulihkan backup otomatis.
            if ($automaticBackup && file_exists($automaticBackup)) {
                try {
                    $rollbackInput = fopen($automaticBackup, 'rb');

                    if (!$rollbackInput) {
                        throw new RuntimeException('Backup otomatis tidak dapat dibuka.');
                    }

                    try {
                        $this->runMysql([
                            $this->binary('mysql'),
                            '--host=' . $db['host'],
                            '--port=' . $db['port'],
                            '--user=' . $db['username'],
                            '--default-character-set=utf8mb4',
                            $db['database'],
                        ], $db['password'], $rollbackInput, null);
                    } finally {
                        fclose($rollbackInput);
                    }
                } catch (\Throwable $rollbackException) {
                    report($rollbackException);
                }
            }

            return response()->json([
                'message' => 'Restore gagal. Sistem sudah mencoba memulihkan backup otomatis. Periksa log Laravel untuk detail.',
            ], 500);
        }
    }
}
