
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Tiket IT Support</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 9px;
            color: #222;
        }

        h1 {
            font-size: 19px;
            margin-bottom: 5px;
        }

        .muted {
            color: #666;
            margin-bottom: 16px;
        }

        .summary {
            width: 100%;
            margin-bottom: 18px;
        }

        .summary td {
            border: 1px solid #ddd;
            padding: 8px;
        }

        table.report {
            width: 100%;
            border-collapse: collapse;
        }

        table.report th,
        table.report td {
            border: 1px solid #ccc;
            padding: 6px;
            text-align: left;
            vertical-align: top;
            word-wrap: break-word;
        }

        table.report th {
            background: #edf1f5;
        }

        .footer {
            margin-top: 15px;
            color: #666;
            font-size: 8px;
        }
    </style>
</head>
<body>
    <h1>Laporan Tiket IT Support</h1>

    <div class="muted">
        Dibuat: {{ $generatedAt->format('d-m-Y H:i') }}
        <br>
        Periode:
        {{ $filters['date_from'] ?? 'Semua tanggal' }}
        sampai
        {{ $filters['date_to'] ?? 'Sekarang' }}
        <br>
        Status: {{ $filters['status'] ?? 'Semua status' }}
        |
        Prioritas: {{ $filters['priority'] ?? 'Semua prioritas' }}
    </div>

    <table class="summary">
        <tr>
            <td>Total tiket: <strong>{{ $summary['total'] }}</strong></td>
            <td>Menunggu: <strong>{{ $summary['menunggu'] }}</strong></td>
            <td>Diproses: <strong>{{ $summary['diproses'] }}</strong></td>
            <td>Selesai: <strong>{{ $summary['selesai'] }}</strong></td>
            <td>Ditutup: <strong>{{ $summary['ditutup'] }}</strong></td>
        </tr>
    </table>

    <table class="report">
        <thead>
            <tr>
                <th>No.</th>
                <th>Nomor Tiket</th>
                <th>Judul</th>
                <th>Klien</th>
                <th>Kategori</th>
                <th>Prioritas</th>
                <th>Status</th>
                <th>Tanggal</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($tickets as $ticket)
                <tr>
                    <td>{{ $loop->iteration }}</td>
                    <td>{{ $ticket->ticket_number }}</td>
                    <td>{{ $ticket->title }}</td>
                    <td>{{ $ticket->user?->name ?? '-' }}</td>
                    <td>{{ $ticket->category }}</td>
                    <td>{{ $ticket->priority }}</td>
                    <td>{{ str_replace('_', ' ', $ticket->status) }}</td>
                    <td>{{ $ticket->created_at?->format('d-m-Y H:i') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="8">Tidak ada tiket untuk filter yang dipilih.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Helpdesk Ticketing System — Laporan internal IT Support
    </div>
</body>
</html>
