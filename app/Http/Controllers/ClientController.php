<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ClientController extends Controller
{
    private function authorizeITSupport(Request $request): void
    {
        abort_unless(
            $request->user()?->role === 'it_support',
            403,
            'Kamu tidak memiliki akses untuk mengelola data klien.'
        );
    }

    public function index(Request $request)
    {
        $this->authorizeITSupport($request);

        $search = trim((string) $request->query('search', ''));

        $clients = User::query()
            ->where('role', 'client')
            ->withCount('tickets')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return response()->json($clients);
    }

    public function store(Request $request)
    {
        $this->authorizeITSupport($request);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $client = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => 'client',
            'is_active' => $data['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Akun klien berhasil dibuat.',
            'client' => $client->only([
                'id',
                'name',
                'email',
                'role',
                'is_active',
                'created_at',
            ]),
        ], 201);
    }

    public function update(Request $request, User $client)
    {
        $this->authorizeITSupport($request);

        abort_unless($client->role === 'client', 404);

        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($client->id),
            ],
            'password' => ['sometimes', 'nullable', 'string', 'min:8', 'confirmed'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if (array_key_exists('password', $data) && empty($data['password'])) {
            unset($data['password']);
        }

        $client->fill($data);
        $client->save();

        return response()->json([
            'message' => 'Data klien berhasil diperbarui.',
            'client' => $client->only([
                'id',
                'name',
                'email',
                'role',
                'is_active',
                'created_at',
            ]),
        ]);
    }

    public function destroy(Request $request, User $client)
    {
        $this->authorizeITSupport($request);

        abort_unless($client->role === 'client', 404);

        if ($client->tickets()->exists()) {
            return response()->json([
                'message' => 'Klien memiliki riwayat tiket. Nonaktifkan akun agar riwayat tiket tetap aman.',
            ], 422);
        }

        $client->delete();

        return response()->json([
            'message' => 'Akun klien berhasil dihapus.',
        ]);
    }
}
