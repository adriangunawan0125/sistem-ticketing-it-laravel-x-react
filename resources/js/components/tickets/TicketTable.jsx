import React from 'react';
import { Search, ChevronDown, ArrowRight, ArrowUpRight } from 'lucide-react';

export default function TicketTable({ tickets, loading, error }) {
    return (
                    <section className="content-card">
                        <div className="card-heading">
                            <div>
                                <h2>Tiket Terbaru</h2>
                                <p>Daftar laporan yang masuk ke sistem.</p>
                            </div>
                            <button className="secondary-button">
                                Lihat semua <ArrowRight size={15} />
                            </button>
                        </div>

                        <div className="filter-row">
                            <div className="search-field">
                                <Search size={16} />
                                <input placeholder="Cari nomor tiket atau masalah..." />
                            </div>
                            <button className="filter-button">
                                Semua Status <ChevronDown size={15} />
                            </button>
                        </div>

                        <div className="table-container">
                            <table className="ticket-table">
                                <thead>
                                    <tr>
                                        <th>INFORMASI TIKET</th>
                                        <th>KLIEN</th>
                                        <th>KATEGORI</th>
                                        <th>PRIORITAS</th>
                                        <th>STATUS</th>
                                        <th>TANGGAL</th>
                                        <th></th>
                                    </tr>
                                </thead>
                              
<tbody>
    {loading && (
        <tr>
            <td colSpan="7">Memuat data tiket...</td>
        </tr>
    )}

    {!loading && error && (
        <tr>
            <td colSpan="7">{error}</td>
        </tr>
    )}

    {!loading && !error && tickets.length === 0 && (
        <tr>
            <td colSpan="7">Belum ada tiket yang dilaporkan.</td>
        </tr>
    )}

    {!loading && !error && tickets.map((ticket) => (
        <tr key={ticket.id}>
            <td>
                <div className="ticket-title">{ticket.title}</div>
                <div className="ticket-id">
                    {ticket.ticket_number}
                </div>
            </td>

            <td>{ticket.user?.name ?? '-'}</td>
            <td>
                <span className="category-label">
                    {ticket.category}
                </span>
            </td>

            <td>
                <span className={`priority priority-${ticket.priority}`}>
                    <span />
                    {ticket.priority}
                </span>
            </td>

            <td>
                <span className={`status status-${ticket.status}`}>
                    {ticket.status.replaceAll('_', ' ')}
                </span>
            </td>

            <td className="date-cell">
                {new Date(ticket.created_at).toLocaleDateString('id-ID')}
            </td>

            <td>
                <button className="row-action" aria-label="Detail tiket">
                    <ArrowUpRight size={17} />
                </button>
            </td>
        </tr>
    ))}
</tbody>

                            </table>
                        </div>

                        <div className="table-footer">
                            <span>Menampilkan {tickets.length} tiket</span>
                            <div className="pagination">
                                <button disabled>Sebelumnya</button>
                                <button className="page-number">1</button>
                                <button>2</button>
                                <button>3</button>
                                <button>Selanjutnya</button>
                            </div>
                        </div>
                    </section>
    );
}
