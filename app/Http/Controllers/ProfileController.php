<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    // Mengambil data profil pengguna
    public function show(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'profile_photo' => $user->profile_photo
                    ? Storage::disk('public')->url($user->profile_photo)
                    : null,
                'department' => $user->department,
                'position' => $user->position,
            ],
        ]);
    }

    // Memperbarui profil pengguna
    public function update(Request $request)
    {
        $user = $request->user();

        $rules = [
            'name' => ['required', 'string', 'max:255'],

            'phone' => [
                'nullable',
                'string',
                'max:20',
                'regex:/^[0-9+\-\s()]+$/',
            ],

            'profile_photo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],
        ];

        // Departemen dan posisi hanya untuk Client
        if ($user->role === 'client') {
            $rules['department'] = [
                'nullable',
                'string',
                'max:255',
            ];

            $rules['position'] = [
                'nullable',
                'string',
                'max:255',
            ];
        }

        $data = $request->validate($rules);

        // Upload foto profil baru
        if ($request->hasFile('profile_photo')) {
            $newPhoto = $request->file('profile_photo')
                ->store('profiles', 'public');

            // Hapus foto lama
            if ($user->profile_photo) {
                Storage::disk('public')->delete(
                    $user->profile_photo
                );
            }

            $user->profile_photo = $newPhoto;
        }

        // Update nama dan nomor telepon
        $user->name = $data['name'];
        $user->phone = $data['phone'] ?? null;

        // Update informasi khusus Client
        if ($user->role === 'client') {
            $user->department = $data['department'] ?? null;
            $user->position = $data['position'] ?? null;
        }

        $user->save();

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',

            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'profile_photo' => $user->profile_photo
                    ? Storage::disk('public')->url($user->profile_photo)
                    : null,
                'department' => $user->department,
                'position' => $user->position,
            ],
        ]);
    }
}
