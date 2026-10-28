
import React from 'react';
import {
    Search,
    ChevronDown,
    ArrowUpRight,
    X,
    LoaderCircle,
    Save,
} from 'lucide-react';

const STATUS_OPTIONS = [
    { value: 'menunggu', label: 'Menunggu' },
    { value: 'diproses', label: 'Diproses' },
    {
        value: 'menunggu_respons_user',
        label: 'Menunggu Respons Klien',
    },
    { value: 'selesai', label: 'Selesai' },
    { value: 'ditutup', label: 'Ditutup' },
];

function formatStatus(status) {
    const option = STATUS_OPTIONS.find((item) => item.value === status);
    return option?.label ?? status ?? '-';
}

function formatDate(date) {
    if (!date) return '-';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return '-';

    return parsedDate.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function TicketDetailModal({
    ticket,
    isITSupport,
    onClose,
    onUpdateStatus,
}) {
    const [status, setStatus] = React.useState(ticket.status ?? 'menunggu');
    const [resolution, setResolution] = React.useState(
        ticket.resolution ?? '',
    );
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (!isITSupport || typeof onUpdateStatus !== 'function') {
            return;
        }

        setSaving(true);

        try {
            await onUpdateStatus(ticket.id, {
                status,
                resolution: resolution.trim() || null,
            });

            setSuccess('Perubahan tiket berhasil disimpan.');

            // Tutup modal setelah penyimpanan berhasil.
            // Data tabel akan diperbarui melalui hook useTickets.
            onClose();
        } catch (err) {
            setError(err.message || 'Gagal menyimpan perubahan tiket.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div
            className="modal-overlay"
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget &&
                    !saving
                ) {
                    onClose();
                }
            }}
        >
            <section
                className="ticket-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="ticket-detail-title"
            >
                <div className="modal-heading">
                    <div>
                        <span className="eyebrow">DETAIL LAPORAN</span>
                        <h2 id="ticket-detail-title">{ticket.title}</h2>
                        <p>{ticket.ticket_number}</p>
                    </div>

                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Tutup detail"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="ticket-detail-content">
                    {isITSupport && (
                        <p>
                            <strong>Klien:</strong>{' '}
                            {ticket.user?.name ?? '-'}
                        </p>
                    )}

                    <p>
                        <strong>Kategori:</strong> {ticket.category ?? '-'}
                    </p>

                    <p>
                        <strong>Prioritas:</strong> {ticket.priority ?? '-'}
                    </p>

                    <p>
                        <strong>Status saat ini:</strong>{' '}
                        <span
                            className={`status status-${ticket.status}`}
                        >
                            {formatStatus(ticket.status)}
                        </span>
                    </p>

                    <p>
                        <strong>Tanggal:</strong>{' '}
                        {formatDate(ticket.created_at)}
                    </p>

                    <div>
                        <strong>Deskripsi masalah</strong>
                        <p className="ticket-description">
                            {ticket.description || '-'}
                        </p>
                    </div>

                    {!isITSupport && (
                        <div>
                            <strong>Catatan penyelesaian</strong>
                            <p className="ticket-description">
                                {ticket.resolution ||
                                    'Belum ada catatan dari IT Support.'}
                            </p>
                        </div>
                    )}
                </div>

                {isITSupport && (
                    <form onSubmit={handleSubmit}>
                        <div className="form-field">
                            <label htmlFor="ticket-status">
                                Ubah Status
                            </label>

                            <select
                                id="ticket-status"
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value)
                                }
                                disabled={saving}
                                required
                            >
                                {STATUS_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-field">
                            <label htmlFor="ticket-resolution">
                                Catatan Penanganan / Penyelesaian
                            </label>

                            <textarea
                                id="ticket-resolution"
                                value={resolution}
                                onChange={(event) =>
                                    setResolution(event.target.value)
                                }
                                placeholder="Contoh: Koneksi jaringan telah diperiksa dan berhasil diperbaiki."
                                rows={4}
                                maxLength={5000}
                                disabled={saving}
                            />

                            <small>
                                Maksimal 5.000 karakter. Catatan ini dapat
                                dilihat oleh klien.
                            </small>
                        </div>

                        {error && (
                            <p className="form-error" role="alert">
                                {error}
                            </p>
                        )}

                        {success && (
                            <p role="status">{success}</p>
                        )}

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={onClose}
                                disabled={saving}
                            >
                                Batal
                            </button>

                            <button
                                type="submit"
                                className="primary-button"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <LoaderCircle
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Simpan Perubahan
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                {!isITSupport && (
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={onClose}
                        >
                            Tutup
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}

export default function TicketTable({
    tickets = [],
    loading = false,
    error = '',
    onUpdateStatus,
}) {
    const currentUser = window.currentUser;
    const isITSupport = currentUser?.role === 'it_support';

   const [search, setSearch] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('semua');
    const [priorityFilter, setPriorityFilter] = React.useState('semua');
    const [selectedTicket, setSelectedTicket] = React.useState(null);
    const [page, setPage] = React.useState(1);

    const perPage = 8;

    
const filteredTickets = tickets.filter((ticket) => {
    const keyword = search.trim().toLowerCase();

    const matchesSearch = [
        ticket.ticket_number,
        ticket.title,
        ticket.category,
        ticket.user?.name,
    ].some((value) =>
        String(value ?? '').toLowerCase().includes(keyword)
    );

    const matchesStatus =
        statusFilter === 'semua' ||
        ticket.status === statusFilter;

    const matchesPriority =
        priorityFilter === 'semua' ||
        ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
});


    const totalPages = Math.max(
        1,
        Math.ceil(filteredTickets.length / perPage),
    );

    const currentPage = Math.min(page, totalPages);

    const displayedTickets = filteredTickets.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage,
    );

    function changeSearch(value) {
        setSearch(value);
        setPage(1);
    }

    function changeStatus(value) {
        setStatusFilter(value);
        setPage(1);
    }

    return (
        <>
            <section className="content-card">
                <div className="card-heading">
                    <div>
                        <h2>
                            {isITSupport ? 'Semua Tiket' : 'Tiket Saya'}
                        </h2>
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
                            onChange={(event) =>
                                changeSearch(event.target.value)
                            }
                            placeholder="Cari nomor tiket atau masalah..."
                            aria-label="Cari tiket"
                        />
                    </div>

                    <div className="filter-button-wrapper">
                        <ChevronDown size={15} />
                        <select
                            className="filter-select"
                            value={statusFilter}
                            onChange={(event) =>
                                changeStatus(event.target.value)
                            }
                            aria-label="Filter status tiket"
                        >
                            <option value="semua">Semua Status</option>
                            {STATUS_OPTIONS.map((option) => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    
<div className="filter-button-wrapper">
    <select
        className="filter-select"
        value={priorityFilter}
        onChange={(event) => {
            setPriorityFilter(event.target.value);
            setPage(1);
        }}
        aria-label="Filter prioritas tiket"
    >
        <option value="semua">Semua Prioritas</option>
        <option value="rendah">Rendah</option>
        <option value="sedang">Sedang</option>
        <option value="tinggi">Tinggi</option>
        <option value="kritis">Kritis</option>
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

                            {!loading &&
                                !error &&
                                displayedTickets.length === 0 && (
                                    <tr>
                                        <td colSpan={isITSupport ? 7 : 6}>
                                            {tickets.length === 0
                                                ? 'Belum ada tiket yang dilaporkan.'
                                                : 'Tidak ada tiket yang sesuai dengan pencarian.'}
                                        </td>
                                    </tr>
                                )}

                            {!loading &&
                                !error &&
                                displayedTickets.map((ticket) => (
                                    <tr key={ticket.id}>
                                        <td>
                                            <div className="ticket-title">
                                                {ticket.title}
                                            </div>
                                            <div className="ticket-id">
                                                {ticket.ticket_number}
                                            </div>
                                        </td>

                                        {isITSupport && (
                                            <td>
                                                {ticket.user?.name ?? '-'}
                                            </td>
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
                                                onClick={() =>
                                                    setSelectedTicket(ticket)
                                                }
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
                        Menampilkan {displayedTickets.length} dari{' '}
                        {filteredTickets.length} tiket
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
                <TicketDetailModal
                    key={selectedTicket.id}
                    ticket={selectedTicket}
                    isITSupport={isITSupport}
                    onClose={() => setSelectedTicket(null)}
                    onUpdateStatus={onUpdateStatus}
                />
            )}
        </>
    );
}
