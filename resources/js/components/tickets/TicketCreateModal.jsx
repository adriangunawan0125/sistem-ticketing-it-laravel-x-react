import React from 'react';

export default function TicketCreateModal({ onClose, onSubmit }) {
    const [form, setForm] = React.useState({
        title: '',
        category: 'Software',
        priority: 'sedang',
        description: '',
    });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    function updateField(event) {
        setForm({
            ...form,
            [event.target.name]: event.target.value,
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            await onSubmit(form);
            onClose();
        } catch (err) {
            setError(err.message || 'Gagal mengirim laporan.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="modal-overlay" onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
        }}>
            <section className="ticket-modal">
                <div className="modal-heading">
                    <div>
                        <span className="eyebrow">PELAPORAN MASALAH</span>
                        <h2>Buat Tiket Baru</h2>
                        <p>Jelaskan kendala yang kamu alami agar dapat segera ditangani.</p>
                    </div>
                    <button type="button" className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label htmlFor="ticket-title">Judul masalah</label>
                        <input
                            id="ticket-title"
                            name="title"
                            value={form.title}
                            onChange={updateField}
                            placeholder="Contoh: Komputer tidak bisa terhubung ke internet"
                            maxLength={255}
                            required
                        />
                    </div>

                    <div className="form-grid">
                        <div className="form-field">
                            <label htmlFor="ticket-category">Kategori</label>
                            <select
                                id="ticket-category"
                                name="category"
                                value={form.category}
                                onChange={updateField}
                            >
                                <option value="Jaringan">Jaringan</option>
                                <option value="Perangkat Keras">Perangkat Keras</option>
                                <option value="Software">Software</option>
                                <option value="Akun & Akses">Akun &amp; Akses</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                        </div>

                        <div className="form-field">
                            <label htmlFor="ticket-priority">Prioritas</label>
                            <select
                                id="ticket-priority"
                                name="priority"
                                value={form.priority}
                                onChange={updateField}
                            >
                                <option value="rendah">Rendah</option>
                                <option value="sedang">Sedang</option>
                                <option value="tinggi">Tinggi</option>
                                <option value="kritis">Kritis</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-field">
                        <label htmlFor="ticket-description">Deskripsi masalah</label>
                        <textarea
                            id="ticket-description"
                            name="description"
                            value={form.description}
                            onChange={updateField}
                            placeholder="Jelaskan kronologi masalah dan apa yang sudah dicoba..."
                            rows={5}
                            maxLength={5000}
                            required
                        />
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="primary-button"
                            disabled={loading}
                        >
                            {loading ? 'Mengirim...' : 'Kirim Laporan'}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}
