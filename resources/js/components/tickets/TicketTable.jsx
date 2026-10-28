
import React from 'react';
import {
    Search,
    ChevronDown,
    ArrowUpRight,
    X,
} from 'lucide-react';

export default function TicketTable({
    tickets = [],
    loading = false,
    error = '',
}) {
    const currentUser = window.currentUser;
    const isITSupport = currentUser?.role === 'it_support';

    const [search, setSearch] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('semua');
    const [selectedTicket, setSelectedTicket] = React.useState(null);
    const [page, setPage] = React.useState(1);

    const perPage = 8;

    const filteredTickets = tickets.filter((ticket) => {
        const keyword = search.toLowerCase();

        const matchesSearch = [
            ticket.ticket_number,
            ticket.title,
            ticket.category,
            ticket.user?.name,
        ].some((value) => String(value ?? '').toLowerCase().includes(keyword));

        const matchesStatus =
            statusFilter === 'semua' || ticket.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.max(1, Math.ceil(filteredTickets.length / perPage));
    const currentPage = Math.min(page, totalPages);

    const displayedTickets = filteredTickets.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage
    );

    function changeSearch(value) {
        setSearch(value);
        setPage(1);
    }

    function changeStatus(value) {
        setStatusFilter(value);
        setPage(1);
    }

    function formatDate(date) {
        if (!date) return '-';

        return new Date(date).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }

    function formatStatus(status) {
        const labels = {
            menunggu: 'Menunggu',
            diproses: 'Diproses',
            menunggu_respons_user: 'Menunggu Respons Klien',
            selesai: 'Selesai',
            ditutup: 'Ditutup',
        };

        return labels[status] || status;
    }

    return (
        <>
            <section className="content-card">
                <div className="card-heading">
                    <div>
                        <h2>{isITSupport ? 'Semua Tiket' : 'Tiket Saya'}</h2>
                        <p>
                            {isITSupport
                                ? 'Pantau laporan dan kendala dari seluruh klien.'
                                : 'Lihat laporan dan status penanganan kendala kamu.'}
                        </p>
                    </div>
                </div>

                <div className="filter-row">
                    <div className="search-field">
                        <Search size={16} />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => changeSearch(event.target.value)}
                            placeholder="Cari nomor tiket atau masalah..."
                            aria-label="Cari tiket"
                        />
                    </div>

                    <div className="filter-button-wrapper">
                        <ChevronDown size={15} />
                        <select
                            className="filter-select"
                            value={statusFilter}
                            onChange={(event) => changeStatus(event.target.value)}
                            aria-label="Filter status tiket"
                        >
                            <option value="semua">Semua Status</option>
                            <option value="menunggu">Menunggu</option>
                            <option value="diproses">Diproses</option>
                            <option value="menunggu_respons_user">
                                Menunggu Respons Klien
                            </option>
                            <option value="selesai">Selesai</option>
                            <option value="ditutup">Ditutup</option>
                        </select>
                    </div>
                </div>

                <div className="table-container">
                    <table className="ticket-table">
                        <thead>
                            <tr>
                                <th>INFORMASI TIKET</th>
                                {isITSupport && <th>KLIEN</th>}
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
                                    <td colSpan={isITSupport ? 7 : 6}>
                                        Memuat data tiket...
                                    </td>
                                </tr>
                            )}

                            {!loading && error && (
                                <tr>
                                    <td colSpan={isITSupport ? 7 : 6}>
                                        {error}
                                    </td>
                                </tr>
                            )}

                            {!loading && !error && displayedTickets.length === 0 && (
                                <tr>
                                    <td colSpan={isITSupport ? 7 : 6}>
                                        {tickets.length === 0
                                            ? 'Belum ada tiket yang dilaporkan.'
                                            : 'Tidak ada tiket yang sesuai dengan pencarian.'}
                                    </td>
                                </tr>
                            )}

                            {!loading && !error && displayedTickets.map((ticket) => (
                                <tr key={ticket.id}>
                                    <td>
                                        <div className="ticket-title">{ticket.title}</div>
                                        <div className="ticket-id">
                                            {ticket.ticket_number}
                                        </div>
                                    </td>

                                    {isITSupport && (
                                        <td>{ticket.user?.name ?? '-'}</td>
                                    )}

                                    <td>
                                        <span className="category-label">
                                            {ticket.category}
                                        </span>
                                    </td>

                                    <td>
                                        <span
                                            className={`priority priority-${ticket.priority}`}
                                        >
                                            <span />
                                            {ticket.priority}
                                        </span>
                                    </td>

                                    <td>
                                        <span
                                            className={`status status-${ticket.status}`}
                                        >
                                            {formatStatus(ticket.status)}
                                        </span>
                                    </td>

                                    <td className="date-cell">
                                        {formatDate(ticket.created_at)}
                                    </td>

                                    <td>
                                        <button
                                            type="button"
                                            className="row-action"
                                            aria-label={`Lihat detail ${ticket.ticket_number}`}
                                            onClick={() => setSelectedTicket(ticket)}
                                        >
                                            <ArrowUpRight size={17} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="table-footer">
                    <span>
                        Menampilkan {displayedTickets.length} dari {filteredTickets.length} tiket
                    </span>

                    <div className="pagination">
                        <button
                            type="button"
                            disabled={currentPage <= 1}
                            onClick={() => setPage(currentPage - 1)}
                        >
                            Sebelumnya
                        </button>

                        <span className="page-number">
                            {currentPage} / {totalPages}
                        </span>

                        <button
                            type="button"
                            disabled={currentPage >= totalPages}
                            onClick={() => setPage(currentPage + 1)}
                        >
                            Selanjutnya
                        </button>
                    </div>
                </div>
            </section>

            {selectedTicket && (
                <div
                    className="modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedTicket(null);
                        }
                    }}
                >
                    <section className="ticket-modal">
                        <div className="modal-heading">
                            <div>
                                <span className="eyebrow">DETAIL LAPORAN</span>
                                <h2>{selectedTicket.title}</h2>
                                <p>{selectedTicket.ticket_number}</p>
                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={() => setSelectedTicket(null)}
                                aria-label="Tutup detail"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="ticket-detail-content">
                            {isITSupport && (
                                <p>
                                    <strong>Klien:</strong>{' '}
                                    {selectedTicket.user?.name ?? '-'}
                                </p>
                            )}

                            <p>
                                <strong>Kategori:</strong>{' '}
                                {selectedTicket.category}
                            </p>

                            <p>
                                <strong>Prioritas:</strong>{' '}
                                {selectedTicket.priority}
                            </p>

                            <p>
                                <strong>Status:</strong>{' '}
                                {formatStatus(selectedTicket.status)}
                            </p>

                            <p>
                                <strong>Tanggal:</strong>{' '}
                                {formatDate(selectedTicket.created_at)}
                            </p>

                            <div>
                                <strong>Deskripsi masalah</strong>
                                <p className="ticket-description">
                                    {selectedTicket.description || '-'}
                                </p>
                            </div>

                            {selectedTicket.resolution && (
                                <div>
                                    <strong>Catatan penyelesaian</strong>
                                    <p className="ticket-description">
                                        {selectedTicket.resolution}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() => setSelectedTicket(null)}
                            >
                                Tutup
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}
