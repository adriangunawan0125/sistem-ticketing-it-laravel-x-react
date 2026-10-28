<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\TicketStatusHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TicketController extends Controller
{
    // Daftar tiket untuk IT Support atau klien.
    public function index(Request $request)
    {
        $query = Ticket::with('user:id,name')
            ->latest();

        if ($request->user()->role === 'client') {
            $query->where('user_id', $request->user()->id);
        }

        return response()->json([
            'tickets' => $query->get(),
        ]);
    }

    // Klien membuat laporan baru.
    public function store(Request $request)
    {
        abort_unless($request->user()->role === 'client', 403);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
            'category' => [
                'required',
                'in:Jaringan,Perangkat Keras,Software,Akun & Akses,Lainnya'
            ],
            'priority' => ['required', 'in:rendah,sedang,tinggi,kritis'],
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
                    . '-' . str_pad((string) $ticket->id, 5, '0', STR_PAD_LEFT),
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

        return response()->json([
            'message' => 'Laporan berhasil dikirim.',
            'ticket' => $ticket,
        ], 201);
    }

    // IT Support memperbarui status tiket.
    public function updateStatus(Request $request, Ticket $ticket)
    {
        abort_unless($request->user()->role === 'it_support', 403);

        $data = $request->validate([
            'status' => [
                'required',
                'in:menunggu,diproses,menunggu_respons_user,selesai,ditutup'
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
                TicketStatusHistory::create([
                    'ticket_id' => $ticket->id,
                    'changed_by' => $request->user()->id,
                    'old_status' => $oldStatus,
                    'new_status' => $ticket->status,
                    'note' => $data['resolution'] ?? null,
                ]);
            }
        });

        return response()->json([
            'message' => 'Status tiket berhasil diperbarui.',
            'ticket' => $ticket->fresh()->load('user:id,name'),
        ]);
    }
    
public function statistics(Request $request)
{
    $query = Ticket::query();

    if ($request->user()->role === 'client') {
        $query->where('user_id', $request->user()->id);
    }

    return response()->json([
        'total' => (clone $query)->count(),
        'menunggu' => (clone $query)->where('status', 'menunggu')->count(),
        'diproses' => (clone $query)->where('status', 'diproses')->count(),
        'selesai' => (clone $query)->where('status', 'selesai')->count(),
    ]);
}

}

