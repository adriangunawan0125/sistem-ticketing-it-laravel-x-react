<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\TicketStatusHistory;
use App\Models\User;
use App\Notifications\TicketNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TicketController extends Controller
{
    /**
     * Field profil pengguna yang ikut dimuat bersama tiket.
     */
    private function userProfileFields()
    {
        return 'id,name,email,phone,profile_photo,department,position,role,is_active';
    }

    /**
     * Menyesuaikan URL foto profil agar bisa diakses oleh React.
     */
    private function formatTicketProfile($ticket)
    {
        if ($ticket->user && $ticket->user->profile_photo) {
            $photo = $ticket->user->profile_photo;

            // Jika sudah berupa URL lengkap, biarkan.
            if (Str::startsWith($photo, ['http://', 'https://'])) {
                // Tidak perlu mengubah URL.
            }
            // Jika sudah berupa path storage, biarkan.
            elseif (Str::startsWith($photo, '/storage/')) {
                // Tidak perlu mengubah path.
            }
            // Jika masih berupa path relatif, tambahkan /storage/.
            else {
                $photo = '/storage/' . ltrim($photo, '/');
            }

            $ticket->user->setAttribute('profile_photo', $photo);
        }

        return $ticket;
    }

    /**
     * Daftar tiket untuk IT Support atau klien.
     */
    public function index(Request $request)
    {
        $query = Ticket::with([
            'user:' . $this->userProfileFields()
        ])->latest();

        if ($request->user()->role === 'client') {
            $query->where('user_id', $request->user()->id);
        }

        $tickets = $query->get();

        $tickets->transform(function ($ticket) {
            return $this->formatTicketProfile($ticket);
        });

        return response()->json([
            'tickets' => $tickets,
        ]);
    }

    /**
     * Klien membuat laporan baru.
     */
    public function store(Request $request)
    {
        abort_unless($request->user()->role === 'client', 403);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
            'category' => [
                'required',
                'in:Jaringan,Perangkat Keras,Software,Akun & Akses,Lainnya',
            ],
            'priority' => [
                'required',
                'in:rendah,sedang,tinggi,kritis',
            ],
        ]);

        $ticket = DB::transaction(function () use ($request, $data) {
            $ticket = Ticket::create([
                'ticket_number' => 'TEMP-' . Str::uuid(),
                'user_id' => $request->user()->id,
                'title' => $data['title'],
                'description' => $data['description'],
                'category' => $data['category'],
                'priority' => $data['priority'],
                'status' => 'menunggu',
            ]);

            $ticket->update([
                'ticket_number' => 'TKT-' . now()->format('Ymd')
                    . '-' . str_pad(
                        (string) $ticket->id,
                        5,
                        '0',
                        STR_PAD_LEFT
                    ),
            ]);

            TicketStatusHistory::create([
                'ticket_id' => $ticket->id,
                'changed_by' => $request->user()->id,
                'old_status' => null,
                'new_status' => 'menunggu',
                'note' => 'Tiket dibuat oleh klien.',
            ]);

            return $ticket;
        });

        // Muat profil pelapor.
        $ticket->load([
            'user:' . $this->userProfileFields()
        ]);

        $this->formatTicketProfile($ticket);

        // Kirim notifikasi ke seluruh IT Support yang aktif.
        User::where('role', 'it_support')
            ->where('is_active', true)
            ->get()
            ->each(function ($user) use ($ticket) {
                $user->notify(
                    new TicketNotification(
                        $ticket,
                        'new_ticket',
                        'Tiket baru dibuat oleh ' . $ticket->user->name
                    )
                );
            });

        return response()->json([
            'message' => 'Laporan berhasil dikirim.',
            'ticket' => $ticket,
        ], 201);
    }

    /**
     * Klien mengedit tiket miliknya.
     */
    public function update(Request $request, Ticket $ticket)
    {
        abort_unless($request->user()->role === 'client', 403);

        abort_unless(
            $ticket->user_id === $request->user()->id,
            403
        );

        abort_unless(
            $ticket->status === 'menunggu',
            403,
            'Tiket hanya dapat diedit selama masih menunggu.'
        );

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
            'category' => [
                'required',
                'in:Jaringan,Perangkat Keras,Software,Akun & Akses,Lainnya',
            ],
            'priority' => [
                'required',
                'in:rendah,sedang,tinggi,kritis',
            ],
        ]);

        $ticket->update($data);

        $ticket = $ticket->fresh()->load([
            'user:' . $this->userProfileFields()
        ]);

        $this->formatTicketProfile($ticket);

        return response()->json([
            'message' => 'Tiket berhasil diperbarui.',
            'ticket' => $ticket,
        ]);
    }

    /**
     * Klien menghapus tiket miliknya.
     */
    public function destroy(Request $request, Ticket $ticket)
    {
        abort_unless($request->user()->role === 'client', 403);

        abort_unless(
            $ticket->user_id === $request->user()->id,
            403
        );

        abort_unless(
            $ticket->status === 'menunggu',
            403,
            'Tiket hanya dapat dihapus selama masih menunggu.'
        );

        $ticket->delete();

        return response()->json([
            'message' => 'Tiket berhasil dihapus.',
        ]);
    }

    /**
     * IT Support mengubah status tiket.
     */
    public function updateStatus(Request $request, Ticket $ticket)
    {
        abort_unless($request->user()->role === 'it_support', 403);

        $data = $request->validate([
            'status' => [
                'required',
                'in:menunggu,diproses,menunggu_respons_user,selesai,ditutup',
            ],
            'resolution' => ['nullable', 'string', 'max:5000'],
        ]);

        DB::transaction(function () use ($request, $ticket, $data) {
            $oldStatus = $ticket->status;

            $ticket->update([
                'status' => $data['status'],
                'resolution' => $data['resolution'] ?? $ticket->resolution,
            ]);

            if ($oldStatus !== $ticket->status) {
                // Simpan riwayat perubahan status.
                TicketStatusHistory::create([
                    'ticket_id' => $ticket->id,
                    'changed_by' => $request->user()->id,
                    'old_status' => $oldStatus,
                    'new_status' => $ticket->status,
                    'note' => $data['resolution'] ?? null,
                ]);

                // Kirim notifikasi kepada pemilik tiket.
                $ticket->user->notify(
                    new TicketNotification(
                        $ticket,
                        'status_changed',
                        'Status tiket ' . $ticket->ticket_number .
                        ' berubah dari ' . $oldStatus .
                        ' menjadi ' . $ticket->status
                    )
                );
            }
        });

        $ticket = $ticket->fresh()->load([
            'user:' . $this->userProfileFields()
        ]);

        $this->formatTicketProfile($ticket);

        return response()->json([
            'message' => 'Status tiket berhasil diperbarui.',
            'ticket' => $ticket,
        ]);
    }

    /**
     * Statistik tiket.
     */
    public function statistics(Request $request)
    {
        $query = Ticket::query();

        if ($request->user()->role === 'client') {
            $query->where('user_id', $request->user()->id);
        }

        return response()->json([
            'total' => (clone $query)->count(),
            'menunggu' => (clone $query)
                ->where('status', 'menunggu')
                ->count(),
            'diproses' => (clone $query)
                ->where('status', 'diproses')
                ->count(),
            'selesai' => (clone $query)
                ->where('status', 'selesai')
                ->count(),
        ]);
    }
}
