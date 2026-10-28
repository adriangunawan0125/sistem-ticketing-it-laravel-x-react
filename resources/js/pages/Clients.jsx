
import React from 'react';
import {
    Search,
    Plus,
    Users,
    Pencil,
    Trash2,
    X,
    LoaderCircle,
    RefreshCw,
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';

async function readResponse(response) {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const validationError =
            data.errors && Object.values(data.errors)[0]?.[0];

        throw new Error(
            validationError || data.message || 'Permintaan gagal.'
        );
    }

    return data;
}

async function apiRequest(url, method = 'GET', body = null) {
    const headers = {
        Accept: 'application/json',
        'X-CSRF-TOKEN':
            document.querySelector('meta[name="csrf-token"]')?.content || '',
    };

    if (body !== null) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
        method,
        headers,
        credentials: 'same-origin',
        ...(body !== null ? { body: JSON.stringify(body) } : {}),
    });

    return readResponse(response);
}

const emptyForm = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    is_active: true,
};

export default function Clients() {
    const currentUser = window.currentUser;

    const [clients, setClients] = React.useState([]);
    const [search, setSearch] = React.useState('');
    const [page, setPage] = React.useState(1);
    const [lastPage, setLastPage] = React.useState(1);
    const [total, setTotal] = React.useState(0);

    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState('');
    const [notice, setNotice] = React.useState('');

    const [showForm, setShowForm] = React.useState(false);
    const [editingClient, setEditingClient] = React.useState(null);
    const [form, setForm] = React.useState(emptyForm);

    const [formError, setFormError] = React.useState('');

    const isITSupport = currentUser?.role === 'it_support';

    const loadClients = React.useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const params = new URLSearchParams({
                search: search.trim(),
                page: String(page),
            });

            const data = await apiRequest(`/api/clients?${params}`);

            setClients(data.data ?? []);
            setLastPage(data.last_page ?? 1);
            setTotal(data.total ?? 0);
        } catch (err) {
            setError(err.message || 'Gagal memuat data klien.');
        } finally {
            setLoading(false);
        }
    }, [search, page]);

    React.useEffect(() => {
        loadClients();
    }, [loadClients]);

    function openCreateForm() {
        setEditingClient(null);
        setForm({ ...emptyForm });
        setFormError('');
        setNotice('');
        setShowForm(true);
    }

    function openEditForm(client) {
        setEditingClient(client);
        setForm({
            name: client.name ?? '',
            email: client.email ?? '',
            password: '',
            password_confirmation: '',
            is_active: Boolean(client.is_active),
        });
        setFormError('');
        setNotice('');
        setShowForm(true);
    }

    function closeForm() {
        if (saving) return;
        setShowForm(false);
        setEditingClient(null);
        setFormError('');
    }

    function updateField(event) {
        const { name, value, type, checked } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === 'checkbox' ? checked : value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);
        setFormError('');
        setNotice('');

        try {
            const payload = {
                name: form.name.trim(),
                email: form.email.trim(),
                is_active: form.is_active,
            };

            let url = '/api/clients';
            let method = 'POST';

            if (editingClient) {
                url = `/api/clients/${editingClient.id}`;
                method = 'PUT';

                if (form.password.trim()) {
                    payload.password = form.password;
                    payload.password_confirmation =
                        form.password_confirmation;
                }
            } else {
                payload.password = form.password;
                payload.password_confirmation =
                    form.password_confirmation;
            }

            const result = await apiRequest(url, method, payload);

            setShowForm(false);
            setEditingClient(null);
            setForm({ ...emptyForm });
            setNotice(result.message || 'Data klien berhasil disimpan.');

            await loadClients();
        } catch (err) {
            setFormError(err.message || 'Gagal menyimpan data klien.');
        } finally {
            setSaving(false);
        }
    }

    async function toggleActive(client) {
        const nextActive = !Boolean(client.is_active);

        const confirmed = window.confirm(
            `${nextActive ? 'Aktifkan' : 'Nonaktifkan'} akun ${client.name}?`
        );

        if (!confirmed) return;

        setError('');
        setNotice('');

        try {
            const result = await apiRequest(
                `/api/clients/${client.id}`,
                'PUT',
                { is_active: nextActive }
            );

            setNotice(result.message || 'Status akun berhasil diperbarui.');
            await loadClients();
        } catch (err) {
            setError(err.message || 'Gagal mengubah status akun.');
        }
    }

    async function deleteClient(client) {
        const confirmed = window.confirm(
            `Hapus akun ${client.name} (${client.email})? Tindakan ini tidak dapat dibatalkan.`
        );

        if (!confirmed) return;

        setError('');
        setNotice('');

        try {
            const result = await apiRequest(
                `/api/clients/${client.id}`,
                'DELETE'
            );

            setNotice(result.message || 'Akun klien berhasil dihapus.');

            if (clients.length === 1 && page > 1) {
                setPage((previous) => previous - 1);
            } else {
                await loadClients();
            }
        } catch (err) {
            setError(err.message || 'Gagal menghapus akun klien.');
        }
    }

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
                            <h1>Data Klien</h1>
                            <p>
                                Kelola akun, akses, dan informasi klien.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="primary-button"
                            onClick={openCreateForm}
                        >
                            <Plus size={17} />
                            Tambah Klien
                        </button>
                    </section>

                    <section className="content-card">
                        <div className="card-heading">
                            <div>
                                <h2>Daftar Klien</h2>
                                <p>
                                    Total {total} akun klien terdaftar.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={loadClients}
                                disabled={loading}
                            >
                                <RefreshCw size={15} />
                                Muat Ulang
                            </button>
                        </div>

                        <div className="filter-row">
                            <div className="search-field">
                                <Search size={16} />
                                <input
                                    type="search"
                                    value={search}
                                    placeholder="Cari nama atau email..."
                                    aria-label="Cari klien"
                                    onChange={(event) => {
                                        setSearch(event.target.value);
                                        setPage(1);
                                    }}
                                />
                            </div>
                        </div>

                        {notice && (
                            <p className="form-success" role="status">
                                {notice}
                            </p>
                        )}

                        {error && (
                            <p className="form-error" role="alert">
                                {error}
                            </p>
                        )}

                        <div className="table-container">
                            <table className="ticket-table">
                                <thead>
                                    <tr>
                                        <th>INFORMASI KLIEN</th>
                                        <th>JUMLAH TIKET</th>
                                        <th>STATUS AKUN</th>
                                        <th>TANGGAL DAFTAR</th>
                                        <th>AKSI</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading && (
                                        <tr>
                                            <td colSpan={5}>
                                                Memuat data klien...
                                            </td>
                                        </tr>
                                    )}

                                    {!loading &&
                                        !error &&
                                        clients.length === 0 && (
                                            <tr>
                                                <td colSpan={5}>
                                                    Belum ada data klien.
                                                </td>
                                            </tr>
                                        )}

                                    {!loading &&
                                        clients.map((client) => (
                                            <tr key={client.id}>
                                                <td>
                                                    <div className="ticket-title">
                                                        {client.name}
                                                    </div>
                                                    <div className="ticket-id">
                                                        {client.email}
                                                    </div>
                                                </td>

                                                <td>
                                                    {client.tickets_count ?? 0}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`status ${
                                                            client.is_active
                                                                ? 'status-selesai'
                                                                : 'status-ditutup'
                                                        }`}
                                                    >
                                                        {client.is_active
                                                            ? 'Aktif'
                                                            : 'Nonaktif'}
                                                    </span>
                                                </td>

                                                <td className="date-cell">
                                                    {client.created_at
                                                        ? new Date(
                                                              client.created_at
                                                          ).toLocaleDateString(
                                                              'id-ID',
                                                              {
                                                                  day: '2-digit',
                                                                  month: 'short',
                                                                  year: 'numeric',
                                                              }
                                                          )
                                                        : '-'}
                                                </td>

                                                <td>
                                                    <div className="client-actions">
                                                        <button
                                                            type="button"
                                                            className="row-action"
                                                            title="Edit klien"
                                                            aria-label={`Edit ${client.name}`}
                                                            onClick={() =>
                                                                openEditForm(client)
                                                            }
                                                        >
                                                            <Pencil size={16} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="secondary-button"
                                                            onClick={() =>
                                                                toggleActive(client)
                                                            }
                                                        >
                                                            {client.is_active
                                                                ? 'Nonaktifkan'
                                                                : 'Aktifkan'}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="row-action"
                                                            title="Hapus klien"
                                                            aria-label={`Hapus ${client.name}`}
                                                            onClick={() =>
                                                                deleteClient(client)
                                                            }
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="table-footer">
                            <span>
                                Halaman {page} dari {lastPage}
                            </span>

                            <div className="pagination">
                                <button
                                    type="button"
                                    disabled={page <= 1 || loading}
                                    onClick={() =>
                                        setPage((previous) => previous - 1)
                                    }
                                >
                                    Sebelumnya
                                </button>

                                <span className="page-number">
                                    {page} / {lastPage}
                                </span>

                                <button
                                    type="button"
                                    disabled={page >= lastPage || loading}
                                    onClick={() =>
                                        setPage((previous) => previous + 1)
                                    }
                                >
                                    Selanjutnya
                                </button>
                            </div>
                        </div>
                    </section>

                    <footer className="page-footer">
                        <span>Helpdesk Ticketing System</span>
                        <span>Versi 1.0.0</span>
                    </footer>
                </div>
            </main>

            {showForm && (
                <div className="modal-overlay">
                    <section className="ticket-modal">
                        <div className="modal-heading">
                            <div>
                                <span className="eyebrow">
                                    MANAJEMEN AKUN
                                </span>
                                <h2>
                                    {editingClient
                                        ? 'Edit Klien'
                                        : 'Tambah Klien'}
                                </h2>
                                <p>
                                    {editingClient
                                        ? 'Perbarui informasi akun klien.'
                                        : 'Buat akun baru untuk klien.'}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={closeForm}
                                disabled={saving}
                                aria-label="Tutup form"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-field">
                                <label htmlFor="client-name">Nama</label>
                                <input
                                    id="client-name"
                                    name="name"
                                    value={form.name}
                                    onChange={updateField}
                                    maxLength={255}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor="client-email">Email</label>
                                <input
                                    id="client-email"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={updateField}
                                    maxLength={255}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor="client-password">
                                    {editingClient
                                        ? 'Password Baru (opsional)'
                                        : 'Password Awal'}
                                </label>
                                <input
                                    id="client-password"
                                    name="password"
                                    type="password"
                                    value={form.password}
                                    onChange={updateField}
                                    minLength={8}
                                    autoComplete="new-password"
                                    required={!editingClient}
                                    placeholder={
                                        editingClient
                                            ? 'Kosongkan jika tidak diganti'
                                            : 'Minimal 8 karakter'
                                    }
                                />
                            </div>

                            {(form.password || !editingClient) && (
                                <div className="form-field">
                                    <label htmlFor="client-password-confirmation">
                                        Konfirmasi Password
                                    </label>
                                    <input
                                        id="client-password-confirmation"
                                        name="password_confirmation"
                                        type="password"
                                        value={form.password_confirmation}
                                        onChange={updateField}
                                        minLength={8}
                                        autoComplete="new-password"
                                        required={
                                            !editingClient ||
                                            Boolean(form.password)
                                        }
                                    />
                                </div>
                            )}

                            <label className="client-active-option">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={form.is_active}
                                    onChange={updateField}
                                />
                                Akun aktif dan dapat digunakan
                            </label>

                            {formError && (
                                <p className="form-error" role="alert">
                                    {formError}
                                </p>
                            )}

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={closeForm}
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
                                            <LoaderCircle size={16} />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        editingClient
                                            ? 'Simpan Perubahan'
                                            : 'Buat Akun'
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </div>
    );
}
