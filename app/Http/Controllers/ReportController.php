<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReportController extends Controller
{
    private function filters(Request $request): array
    {
        return Validator::make($request->query(), [
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'status' => [
                'nullable',
                'in:menunggu,diproses,menunggu_respons_user,selesai,ditutup',
            ],
            'priority' => ['nullable', 'in:rendah,sedang,tinggi,kritis'],
        ])->validate();
    }

    private function getTickets(array $filters)
    {
        return Ticket::query()
            ->with('user:id,name,email')
            ->when(
                !empty($filters['date_from']),
                fn ($query) => $query->whereDate(
                    'created_at',
                    '>=',
                    $filters['date_from']
                )
            )
            ->when(
                !empty($filters['date_to']),
                fn ($query) => $query->whereDate(
                    'created_at',
                    '<=',
                    $filters['date_to']
                )
            )
            ->when(
                !empty($filters['status']),
                fn ($query) => $query->where(
                    'status',
                    $filters['status']
                )
            )
            ->when(
                !empty($filters['priority']),
                fn ($query) => $query->where(
                    'priority',
                    $filters['priority']
                )
            )
            ->latest()
            ->get();
    }

    private function summary($tickets): array
    {
        return [
            'total' => $tickets->count(),
            'menunggu' => $tickets->where('status', 'menunggu')->count(),
            'diproses' => $tickets->where('status', 'diproses')->count(),
            'selesai' => $tickets->where('status', 'selesai')->count(),
            'ditutup' => $tickets->where('status', 'ditutup')->count(),
        ];
    }

    public function index(Request $request)
    {
        abort_unless($request->user()->role === 'it_support', 403);

        $filters = $this->filters($request);
        $tickets = $this->getTickets($filters);

        return response()->json([
            'summary' => $this->summary($tickets),
            'tickets' => $tickets,
            'filters' => $filters,
        ]);
    }

    public function exportCsv(Request $request)
    {
        abort_unless($request->user()->role === 'it_support', 403);

        $filters = $this->filters($request);
        $tickets = $this->getTickets($filters);

        $filename = 'laporan-tiket-' . now()->format('Y-m-d-His') . '.csv';

        return response()->streamDownload(function () use ($tickets) {
            $output = fopen('php://output', 'w');

            // BOM agar karakter UTF-8 terbaca baik di Excel.
            fwrite($output, "\xEF\xBB\xBF");

            fputcsv($output, [
                'Nomor Tiket',
                'Judul',
                'Nama Klien',
                'Email Klien',
                'Kategori',
                'Prioritas',
                'Status',
                'Tanggal Dibuat',
                'Catatan Penyelesaian',
            ], ';');

            foreach ($tickets as $ticket) {
                fputcsv($output, [
                    $ticket->ticket_number,
                    $ticket->title,
                    $ticket->user?->name ?? '-',
                    $ticket->user?->email ?? '-',
                    $ticket->category,
                    $ticket->priority,
                    $ticket->status,
                    $ticket->created_at?->format('Y-m-d H:i:s'),
                    $ticket->resolution ?? '',
                ], ';');
            }

            fclose($output);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function exportPdf(Request $request)
    {
        abort_unless($request->user()->role === 'it_support', 403);

        $filters = $this->filters($request);
        $tickets = $this->getTickets($filters);

        $pdf = Pdf::loadView('reports.tickets-pdf', [
            'tickets' => $tickets,
            'summary' => $this->summary($tickets),
            'filters' => $filters,
            'generatedAt' => now(),
        ])->setPaper('a4', 'landscape');

        return $pdf->download(
            'laporan-tiket-' . now()->format('Y-m-d-His') . '.pdf'
        );
    }
}
