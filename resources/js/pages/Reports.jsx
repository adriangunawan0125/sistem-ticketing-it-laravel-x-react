
import React from 'react';
import { FileDown, FileSpreadsheet, Search, RefreshCw } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';

async function getReport(url) {
    const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || 'Gagal memuat laporan.');
    }

    return data;
}

export default function Reports() {
    const currentUser = window.currentUser;

    const [filters, setFilters] = React.useState({
        date_from: '',
        date_to: '',
        status: '',
        priority: '',
    });

    const [report, setReport] = React.useState({
        summary: {
            total: 0,
            menunggu: 0,
            diproses: 0,
            selesai: 0,
            ditutup: 0,
        },
        tickets: [],
    });

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const isITSupport = currentUser?.role === 'it_support';

    function queryString() {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });

        return params.toString();
    }

    async function loadReport(event) {
        event?.preventDefault();
        setLoading(true);
        setError('');

        try {
            const query = queryString();
            const data = await getReport(
                `/api/reports/tickets${query ? `?${query}` : ''}`
            );

            setReport(data);
        } catch (err) {
            setError(err.message || 'Gagal memuat laporan.');
        } finally {
            setLoading(false);
        }
    }

    
function resetFilters() {
    const emptyFilters = {
        date_from: '',
        date_to: '',
        status: '',
        priority: '',
    };

    setFilters(emptyFilters);
    setLoading(true);
    setError('');

    getReport('/api/reports/tickets')
        .then(setReport)
        .catch((err) => {
            setError(err.message || 'Gagal memuat laporan.');
        })
        .finally(() => setLoading(false));
}


    function downloadReport(format) {
        const query = queryString();
        const suffix = format === 'pdf' ? 'pdf' : 'csv';

        window.location.href =
            `/api/reports/tickets.${suffix}${query ? `?${query}` : ''}`;
    }

    React.useEffect(() => {
        loadReport();
    }, []);

    if (!isITSupport) {
        return (
            <div className="app-shell">
                <Sidebar currentUser={currentUser} />
                <main className="main-area">
                    <Topbar />
                    <div className="page-content">
                        <section className="content-card">
                            <h2>Akses ditolak</h2>
                            <p>Halaman ini hanya untuk IT Support.</p>
                        </section>
                    </div>
                </main>
            </div>
        );
    }

    const summaryCards = [
        { label: 'Total Tiket', value: report.summary.total },
        { label: 'Menunggu', value: report.summary.menunggu },
        { label: 'Diproses', value: report.summary.diproses },
        { label: 'Selesai', value: report.summary.selesai },
        { label: 'Ditutup', value: report.summary.ditutup },
    ];

    return (
        <div className="app-shell">
            <Sidebar currentUser={currentUser} />

            <main className="main-area">
                <Topbar />

                <div className="page-content">
                    <section className="page-heading">
                        <div>
                            <span className="eyebrow">
                                IT SUPPORT WORKSPACE
                            </span>
                            <h1>Laporan Tiket</h1>
                            <p>
                                Filter dan unduh rekap laporan dalam format PDF atau CSV.
                            </p>
                        </div>
                    </section>

                    <section className="content-card">
                        <div className="card-heading">
                            <div>
                                <h2>Filter Laporan</h2>
                                <p>
                                    Pilih periode, status, dan prioritas tiket.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={loadReport}>
                            <div className="report-filters">
                                <div className="form-field">
                                    <label htmlFor="report-date-from">
                                        Dari tanggal
                                    </label>
                                    <input
                                        id="report-date-from"
                                        type="date"
                                        value={filters.date_from}
                                        max={filters.date_to || undefined}
                                        onChange={(event) =>
                                            setFilters((old) => ({
                                                ...old,
                                                date_from: event.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="form-field">
                                    <label htmlFor="report-date-to">
                                        Sampai tanggal
                                    </label>
                                    <input
                                        id="report-date-to"
                                        type="date"
                                        value={filters.date_to}
                                        min={filters.date_from || undefined}
                                        onChange={(event) =>
                                            setFilters((old) => ({
                                                ...old,
                                                date_to: event.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="form-field">
                                    <label htmlFor="report-status">
                                        Status
                                    </label>
                                    <select
                                        id="report-status"
                                        value={filters.status}
                                        onChange={(event) =>
                                            setFilters((old) => ({
                                                ...old,
                                                status: event.target.value,
                                            }))
                                        }
                                    >
                                        <option value="">Semua Status</option>
                                        <option value="menunggu">Menunggu</option>
                                        <option value="diproses">Diproses</option>
                                        <option value="menunggu_respons_user">
                                            Menunggu Respons Klien
                                        </option>
                                        <option value="selesai">Selesai</option>
                                        <option value="ditutup">Ditutup</option>
                                    </select>
                                </div>

                                <div className="form-field">
                                    <label htmlFor="report-priority">
                                        Prioritas
                                    </label>
                                    <select
                                        id="report-priority"
                                        value={filters.priority}
                                        onChange={(event) =>
                                            setFilters((old) => ({
                                                ...old,
                                                priority: event.target.value,
                                            }))
                                        }
                                    >
                                        <option value="">Semua Prioritas</option>
                                        <option value="rendah">Rendah</option>
                                        <option value="sedang">Sedang</option>
                                        <option value="tinggi">Tinggi</option>
                                        <option value="kritis">Kritis</option>
                                    </select>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={loading}
                                >
                                    <Search size={16} />
                                    {loading ? 'Memuat...' : 'Terapkan Filter'}
                                </button>

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() => {
                                        setFilters({
                                            date_from: '',
                                            date_to: '',
                                            status: '',
                                            priority: '',
                                        });
                                        setTimeout(() => loadReport(), 0);
                                    }}
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    </section>

                    {error && (
                        <p className="form-error" role="alert">{error}</p>
                    )}

                    <div className="report-summary-grid">
                        {summaryCards.map((item) => (
                            <section className="content-card" key={item.label}>
                                <span className="report-summary-label">
                                    {item.label}
                                </span>
                                <strong className="report-summary-value">
                                    {item.value}
                                </strong>
                            </section>
                        ))}
                    </div>

                    <section className="content-card">
                        <div className="card-heading">
                            <div>
                                <h2>Data Laporan</h2>
                                <p>
                                    {report.tickets.length} tiket sesuai filter.
                                </p>
                            </div>

                            <div className="report-export-actions">
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() => downloadReport('csv')}
                                >
                                    <FileSpreadsheet size={16} />
                                    Export CSV
                                </button>

                                <button
                                    type="button"
                                    className="primary-button"
                                    onClick={() => downloadReport('pdf')}
                                >
                                    <FileDown size={16} />
                                    Export PDF
                                </button>
                            </div>
                        </div>

                        <div className="table-container">
                            <table className="ticket-table">
                                <thead>
                                    <tr>
                                        <th>NOMOR TIKET</th>
                                        <th>JUDUL</th>
                                        <th>KLIEN</th>
                                        <th>PRIORITAS</th>
                                        <th>STATUS</th>
                                        <th>TANGGAL</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {report.tickets.length === 0 ? (
                                        <tr>
                                            <td colSpan={6}>
                                                Tidak ada tiket untuk filter ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        report.tickets.map((ticket) => (
                                            <tr key={ticket.id}>
                                                <td>{ticket.ticket_number}</td>
                                                <td>{ticket.title}</td>
                                                <td>{ticket.user?.name ?? '-'}</td>
                                                <td>{ticket.priority}</td>
                                                <td>
                                                    {ticket.status.replaceAll('_', ' ')}
                                                </td>
                                                <td>
                                                    {ticket.created_at
                                                        ? new Date(
                                                              ticket.created_at
                                                          ).toLocaleDateString('id-ID')
                                                        : '-'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <footer className="page-footer">
                        <span>Helpdesk Ticketing System</span>
                        <span>Versi 1.0.0</span>
                    </footer>
                </div>
            </main>
        </div>
    );
}
