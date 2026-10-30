import React from 'react';
import {
    Search,
    ChevronDown,
    ArrowUpRight,
    X,
    LoaderCircle,
    Save,
    Pencil,
    Trash2,
    UserRound,
    Mail,
    Phone,
    Building2,
    Briefcase,
} from 'lucide-react';

import {
    confirmAction,
    showToast,
    showError,
} from '../../utils/alerts';

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

function ReporterAvatar({ user }) {
    const [imageError, setImageError] = React.useState(false);

    const initials = (user?.name || 'U')
        .charAt(0)
        .toUpperCase();

    React.useEffect(() => {
        setImageError(false);
    }, [user?.profile_photo]);

    return (
        <div className="reporter-avatar">
            {user?.profile_photo && !imageError ? (
                <img
                    src={user.profile_photo}
                    alt={`Foto ${user.name || 'pelapor'}`}
                    onError={() => setImageError(true)}
                />
            ) : (
                <span>{initials}</span>
            )}
        </div>
    );
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
        <section className="reporter-profile-card">
            <div className="reporter-profile-heading">
                <UserRound size={18} />
                <h3>Informasi Pelapor</h3>
            </div>

            <div className="reporter-profile-main">
                <ReporterAvatar user={ticket.user} />

                <div className="reporter-profile-name">
                    <strong>
                        {ticket.user?.name || 'Nama tidak tersedia'}
                    </strong>

                    <span>
                        {ticket.user?.role === 'client'
                            ? 'Klien'
                            : ticket.user?.role || 'Pengguna'}
                    </span>

                    <span
                        className={`reporter-account-status ${
                            ticket.user?.is_active
                                ? 'active'
                                : 'inactive'
                        }`}
                    >
                        {ticket.user?.is_active
                            ? 'Akun Aktif'
                            : 'Akun Tidak Aktif'}
                    </span>
                </div>
            </div>

            <div className="reporter-profile-details">

                <div className="reporter-detail-item">
                    <Mail size={16} />
                    <div>
                        <span>Email</span>
                        <strong>
                            {ticket.user?.email || '-'}
                        </strong>
                    </div>
                </div>

                <div className="reporter-detail-item">
                    <Phone size={16} />
                    <div>
                        <span>Nomor Telepon</span>
                        <strong>
                            {ticket.user?.phone || '-'}
                        </strong>
                    </div>
                </div>

                <div className="reporter-detail-item">
                    <Building2 size={16} />
                    <div>
                        <span>Departemen</span>
                        <strong>
                            {ticket.user?.department || '-'}
                        </strong>
                    </div>
                </div>

                <div className="reporter-detail-item">
                    <Briefcase size={16} />
                    <div>
                        <span>Jabatan</span>
                        <strong>
                            {ticket.user?.position || '-'}
                        </strong>
                    </div>
                </div>

            </div>
        </section>
    )}

    <p>
        <strong>Kategori:</strong> {ticket.category ?? '-'}
    </p>

    <p>
        <strong>Prioritas:</strong> {ticket.priority ?? '-'}
    </p>

    <p>
        <strong>Status saat ini:</strong>{' '}
        <span className={`status status-${ticket.status}`}>
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


function TicketEditModal({ ticket, onClose, onSuccess }) {
    const [form, setForm] = React.useState({
        title: ticket.title || '',
        description: ticket.description || '',
        category: ticket.category || '',
        priority: ticket.priority || 'sedang',
    });

    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState('');

    function updateField(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);
        setError('');

        try {
            const response = await fetch(`/api/tickets/${ticket.id}`, {
                method: 'PUT',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document.querySelector(
                            'meta[name="csrf-token"]'
                        )?.content || '',
                },
                body: JSON.stringify(form),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const validationError =
                    data.errors &&
                    Object.values(data.errors)[0]?.[0];

                throw new Error(
                    validationError ||
                    data.message ||
                    'Gagal memperbarui tiket.'
                );
            }

            onClose();
            await showToast('Tiket berhasil diperbarui.');
            onSuccess();
        } catch (err) {
            setError(err.message);
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
            >
                <div className="modal-heading">
                    <div>
                        <span className="eyebrow">
                            EDIT LAPORAN
                        </span>
                        <h2>Edit Tiket</h2>
                        <p>{ticket.ticket_number}</p>
                    </div>

                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                        disabled={saving}
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label htmlFor="edit-ticket-title">
                            Judul Masalah
                        </label>
                        <input
                            id="edit-ticket-title"
                            name="title"
                            value={form.title}
                            onChange={updateField}
                            maxLength={255}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="edit-ticket-description">
                            Deskripsi
                        </label>
                        <textarea
                            id="edit-ticket-description"
                            name="description"
                            value={form.description}
                            onChange={updateField}
                            rows={4}
                            maxLength={5000}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="edit-ticket-category">
                            Kategori
                        </label>
                        <select
                            id="edit-ticket-category"
                            name="category"
                            value={form.category}
                            onChange={updateField}
                            required
                        >
                            <option value="Jaringan">Jaringan</option>
                            <option value="Perangkat Keras">
                                Perangkat Keras
                            </option>
                            <option value="Software">Software</option>
                            <option value="Akun & Akses">
                                Akun & Akses
                            </option>
                            <option value="Lainnya">Lainnya</option>
                        </select>
                    </div>

                    <div className="form-field">
                        <label htmlFor="edit-ticket-priority">
                            Prioritas
                        </label>
                        <select
                            id="edit-ticket-priority"
                            name="priority"
                            value={form.priority}
                            onChange={updateField}
                            required
                        >
                            <option value="rendah">Rendah</option>
                            <option value="sedang">Sedang</option>
                            <option value="tinggi">Tinggi</option>
                            <option value="kritis">Kritis</option>
                        </select>
                    </div>

                    {error && (
                        <p className="form-error" role="alert">
                            {error}
                        </p>
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
    const [editingTicket, setEditingTicket] = React.useState(null);
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

async function handleDeleteTicket(ticket) {
    const confirmed = await confirmAction({
        title: 'Hapus tiket?',
        text: `Tiket ${ticket.ticket_number} akan dihapus secara permanen.`,
        confirmText: 'Ya, hapus',
        cancelText: 'Batal',
    });

    if (!confirmed) return;

    try {
        const response = await fetch(`/api/tickets/${ticket.id}`, {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'X-CSRF-TOKEN':
                    document.querySelector(
                        'meta[name="csrf-token"]'
                    )?.content || '',
            },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                data.message || 'Gagal menghapus tiket.'
            );
        }

        await showToast('Tiket berhasil dihapus.');

        window.location.reload();
    } catch (err) {
        showError('Gagal menghapus tiket', err.message);
    }
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
                                            
<div className="client-actions">
    <button
        type="button"
        className="row-action"
        title="Lihat detail"
        aria-label={`Lihat detail ${ticket.ticket_number}`}
        onClick={() => setSelectedTicket(ticket)}
    >
        <ArrowUpRight size={17} />
    </button>

    {!isITSupport && ticket.status === 'menunggu' && (
        <>
            <button
                type="button"
                className="row-action"
                title="Edit tiket"
                aria-label={`Edit ${ticket.ticket_number}`}
                onClick={() => setEditingTicket(ticket)}
            >
                <Pencil size={16} />
            </button>

            <button
                type="button"
                className="row-action"
                title="Hapus tiket"
                aria-label={`Hapus ${ticket.ticket_number}`}
                onClick={() => handleDeleteTicket(ticket)}
            >
                <Trash2 size={16} />
            </button>
        </>
    )}
</div>

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
            {editingTicket && (
    <TicketEditModal
        ticket={editingTicket}
        onClose={() => setEditingTicket(null)}
        onSuccess={() => window.location.reload()}
    />
)}
        </>
    );
}
