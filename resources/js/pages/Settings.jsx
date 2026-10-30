
import React from 'react';
import Swal from 'sweetalert2';
import {
    Database,
    Download,
    Upload,
    ShieldCheck,
    AlertTriangle,
    LoaderCircle,
    FileText,
    UserRound,
    Camera,
    Save,
    Phone,
    Building2,
    Briefcase,
    Mail,
} from 'lucide-react';

import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';

export default function Settings() {
    const [currentUser, setCurrentUser] = React.useState(
        window.currentUser || {}
    );

    const isITSupport = currentUser?.role === 'it_support';

    // Profile states
    const [profileLoading, setProfileLoading] = React.useState(true);
    const [profileSaving, setProfileSaving] = React.useState(false);

    const [name, setName] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [department, setDepartment] = React.useState('');
    const [position, setPosition] = React.useState('');

    const [profilePhoto, setProfilePhoto] = React.useState(null);
    const [photoPreview, setPhotoPreview] = React.useState(null);
    const [savedPhoto, setSavedPhoto] = React.useState(null);

    const photoInputRef = React.useRef(null);

    // Backup states
    const [backupLoading, setBackupLoading] = React.useState(false);
    const [restoreLoading, setRestoreLoading] = React.useState(false);
    const [file, setFile] = React.useState(null);
    const [password, setPassword] = React.useState('');
    const [confirmed, setConfirmed] = React.useState(false);

    const csrfToken =
        document.querySelector('meta[name="csrf-token"]')?.content || '';

    // =====================================
    // LOAD PROFILE
    // =====================================

    React.useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        setProfileLoading(true);

        try {
            const response = await fetch('/api/profile', {
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'Gagal mengambil data profil.'
                );
            }

            const user = data.user;

            setCurrentUser(user);
            window.currentUser = {
                ...window.currentUser,
                ...user,
            };

            setName(user.name || '');
            setPhone(user.phone || '');
            setDepartment(user.department || '');
            setPosition(user.position || '');

            setSavedPhoto(user.profile_photo || null);
            setPhotoPreview(user.profile_photo || null);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal Memuat Profil',
                text: error.message,
                confirmButtonColor: '#3157ce',
            });
        } finally {
            setProfileLoading(false);
        }
    }

    // =====================================
    // PHOTO PREVIEW
    // =====================================

    function handlePhotoChange(event) {
        const selectedFile = event.target.files?.[0];

        if (!selectedFile) return;

        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
        ];

        if (!allowedTypes.includes(selectedFile.type)) {
            Swal.fire({
                icon: 'warning',
                title: 'Format Tidak Didukung',
                text: 'Gunakan foto JPG, PNG, atau WEBP.',
                confirmButtonColor: '#3157ce',
            });

            event.target.value = '';
            return;
        }

        if (selectedFile.size > 2 * 1024 * 1024) {
            Swal.fire({
                icon: 'warning',
                title: 'Ukuran Foto Terlalu Besar',
                text: 'Ukuran foto maksimal 2 MB.',
                confirmButtonColor: '#3157ce',
            });

            event.target.value = '';
            return;
        }

        setProfilePhoto(selectedFile);

        const previewUrl = URL.createObjectURL(selectedFile);
        setPhotoPreview(previewUrl);
    }

    // =====================================
    // UPDATE PROFILE
    // =====================================

    async function updateProfile(event) {
        event.preventDefault();

        if (!name.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Nama Belum Diisi',
                text: 'Silakan masukkan nama lengkap.',
                confirmButtonColor: '#3157ce',
            });

            return;
        }

        setProfileSaving(true);

        try {
            const formData = new FormData();

            formData.append('name', name.trim());
            formData.append('phone', phone.trim());

            if (!isITSupport) {
                formData.append('department', department);
                formData.append('position', position);
            }

            if (profilePhoto) {
                formData.append('profile_photo', profilePhoto);
            }

            const response = await fetch('/api/profile', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                const validationError =
                    data.errors &&
                    Object.values(data.errors)[0]?.[0];

                throw new Error(
                    validationError ||
                    data.message ||
                    'Gagal memperbarui profil.'
                );
            }

            const updatedUser = data.user;

            setCurrentUser(updatedUser);

            // Update global user data
            window.currentUser = {
                ...window.currentUser,
                ...updatedUser,
            };

            setName(updatedUser.name || '');
            setPhone(updatedUser.phone || '');
            setDepartment(updatedUser.department || '');
            setPosition(updatedUser.position || '');

            setSavedPhoto(updatedUser.profile_photo || null);
            setPhotoPreview(updatedUser.profile_photo || null);
            setProfilePhoto(null);

            if (photoInputRef.current) {
                photoInputRef.current.value = '';
            }

            // Notify components that profile has changed
            window.dispatchEvent(
                new CustomEvent('profile:updated', {
                    detail: updatedUser,
                })
            );

            await Swal.fire({
                icon: 'success',
                title: 'Profil Berhasil Diperbarui!',
                text: 'Informasi profil kamu berhasil disimpan.',
                confirmButtonText: 'Oke',
                confirmButtonColor: '#3157ce',
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal Menyimpan Profil',
                text: error.message,
                confirmButtonColor: '#d92d20',
            });
        } finally {
            setProfileSaving(false);
        }
    }

    // =====================================
    // BACKUP DATABASE
    // =====================================

    async function exportDatabase() {
        setBackupLoading(true);

        try {
            const response = await fetch('/api/settings/backup', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));

                throw new Error(
                    data.message || 'Backup database gagal.'
                );
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = url;
            link.download = `backup-${new Date()
                .toISOString()
                .replace(/[:.]/g, '-')}.sql`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);

            await Swal.fire({
                icon: 'success',
                title: 'Backup Berhasil!',
                text: 'File database berhasil diunduh.',
                confirmButtonText: 'Oke, Mengerti',
                confirmButtonColor: '#3157ce',
            });
        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Backup Gagal!',
                text: err.message || 'Terjadi kesalahan saat membuat backup.',
                confirmButtonText: 'Tutup',
                confirmButtonColor: '#d92d20',
            });
        } finally {
            setBackupLoading(false);
        }
    }

    // =====================================
    // RESTORE DATABASE
    // =====================================

    async function restoreDatabase(event) {
        event.preventDefault();

        if (!file || !password || !confirmed) {
            await Swal.fire({
                icon: 'warning',
                title: 'Data Belum Lengkap',
                text: 'Pilih file backup, masukkan password, dan centang konfirmasi.',
                confirmButtonText: 'Mengerti',
                confirmButtonColor: '#3157ce',
            });

            return;
        }

        const confirmation = await Swal.fire({
            icon: 'warning',
            title: 'Restore Database?',
            html: `
                <p style="color:#64748b;font-size:14px;line-height:1.7">
                    Database saat ini akan diganti mengikuti isi file backup.
                </p>
                <div style="
                    background:#fff7ed;
                    color:#c2410c;
                    padding:12px;
                    border-radius:9px;
                    font-size:12px;
                    margin-top:12px;
                ">
                    Pastikan file backup yang dipilih benar.
                    Sistem akan membuat backup otomatis sebelum restore.
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Ya, Lanjutkan',
            cancelButtonText: 'Batalkan',
            confirmButtonColor: '#d97706',
            cancelButtonColor: '#64748b',
            reverseButtons: true,
            focusCancel: true,
        });

        if (!confirmation.isConfirmed) return;

        setRestoreLoading(true);

        Swal.fire({
            title: 'Memulihkan Database...',
            html: 'Mohon tunggu. Jangan tutup halaman selama proses berlangsung.',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            const formData = new FormData();

            formData.append('backup_file', file);
            formData.append('password', password);
            formData.append('confirmation', '1');

            const response = await fetch('/api/settings/restore', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'same-origin',
                body: formData,
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const validationError =
                    data.errors && Object.values(data.errors)[0]?.[0];

                throw new Error(
                    validationError ||
                    data.message ||
                    'Restore database gagal.'
                );
            }

            setFile(null);
            setPassword('');
            setConfirmed(false);
            event.target.reset();

            await Swal.fire({
                icon: 'success',
                title: 'Restore Berhasil!',
                text: data.message || 'Database berhasil dipulihkan.',
                confirmButtonText: 'Selesai',
                confirmButtonColor: '#3157ce',
            });
        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Restore Gagal!',
                text: err.message || 'Terjadi kesalahan saat memulihkan database.',
                confirmButtonText: 'Tutup',
                confirmButtonColor: '#d92d20',
            });
        } finally {
            setRestoreLoading(false);
        }
    }

    // =====================================
    // AVATAR
    // =====================================

    function getInitials(value) {
        return (value || 'U').charAt(0).toUpperCase();
    }

    // =====================================
    // RENDER
    // =====================================

    return (
        <div className="app-shell">
            <Sidebar currentUser={currentUser} />

            <main className="main-area">
                <Topbar currentUser={currentUser} />

                <div className="page-content">
                    <section className="page-heading">
                        <div>
                            <span className="eyebrow">
                                {isITSupport
                                    ? 'IT SUPPORT WORKSPACE'
                                    : 'CLIENT WORKSPACE'}
                            </span>

                            <h1>Pengaturan</h1>

                            <p>
                                Kelola informasi profil dan pengaturan akun kamu.
                            </p>
                        </div>
                    </section>

                    {/* ================================= */}
                    {/* PROFILE SECTION */}
                    {/* ================================= */}

                    <section className="content-card settings-section">
                        <div className="settings-section-heading">
                            <div className="settings-icon">
                                <UserRound size={22} />
                            </div>

                            <div>
                                <h2>Profil Pengguna</h2>
                                <p>
                                    Perbarui informasi pribadi dan foto profil.
                                </p>
                            </div>
                        </div>

                        {profileLoading ? (
                            <div className="settings-info">
                                <LoaderCircle size={20} />
                                <span>Memuat informasi profil...</span>
                            </div>
                        ) : (
                            <form onSubmit={updateProfile}>
                                <div className="profile-photo-section">
                                    <div className="profile-photo-preview">
                                        {photoPreview ? (
                                            <img
                                                src={photoPreview}
                                                alt="Foto profil"
                                            />
                                        ) : (
                                            <span>
                                                {getInitials(name)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="profile-photo-info">
                                        <strong>Foto Profil</strong>
                                        <p>
                                            Gunakan foto JPG, PNG, atau WEBP.
                                            Maksimal 2 MB.
                                        </p>

                                        <input
                                            ref={photoInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handlePhotoChange}
                                            hidden
                                        />

                                        <button
                                            type="button"
                                            className="secondary-button"
                                            onClick={() =>
                                                photoInputRef.current?.click()
                                            }
                                        >
                                            <Camera size={16} />
                                            Pilih Foto
                                        </button>
                                    </div>
                                </div>

                                <div className="profile-form-grid">
                                    <div className="form-field">
                                        <label htmlFor="profile-name">
                                            Nama Lengkap
                                        </label>

                                        <input
                                            id="profile-name"
                                            type="text"
                                            value={name}
                                            onChange={(event) =>
                                                setName(event.target.value)
                                            }
                                            placeholder="Masukkan nama lengkap"
                                            maxLength={255}
                                            required
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label htmlFor="profile-email">
                                            Email
                                        </label>

                                        <div className="profile-readonly-field">
                                            <Mail size={16} />
                                            <input
                                                id="profile-email"
                                                type="email"
                                                value={currentUser.email || ''}
                                                disabled
                                            />
                                        </div>

                                        <small>Email tidak dapat diubah.</small>
                                    </div>

                                    <div className="form-field">
                                        <label htmlFor="profile-phone">
                                            Nomor Telepon
                                        </label>

                                        <div className="profile-readonly-field">
                                            <Phone size={16} />
                                            <input
                                                id="profile-phone"
                                                type="tel"
                                                value={phone}
                                                onChange={(event) =>
                                                    setPhone(event.target.value)
                                                }
                                                placeholder="Contoh: 081234567890"
                                                maxLength={20}
                                            />
                                        </div>
                                    </div>

                                    {!isITSupport && (
                                        <>
                                            <div className="form-field">
                                                <label htmlFor="profile-department">
                                                    Departemen
                                                </label>

                                                <div className="profile-readonly-field">
                                                    <Building2 size={16} />
                                                    <input
                                                        id="profile-department"
                                                        type="text"
                                                        value={department}
                                                        onChange={(event) =>
                                                            setDepartment(
                                                                event.target.value
                                                            )
                                                        }
                                                        placeholder="Contoh: Keuangan"
                                                        maxLength={255}
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-field">
                                                <label htmlFor="profile-position">
                                                    Posisi / Jabatan
                                                </label>

                                                <div className="profile-readonly-field">
                                                    <Briefcase size={16} />
                                                    <input
                                                        id="profile-position"
                                                        type="text"
                                                        value={position}
                                                        onChange={(event) =>
                                                            setPosition(
                                                                event.target.value
                                                            )
                                                        }
                                                        placeholder="Contoh: Staff Keuangan"
                                                        maxLength={255}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="profile-save-action">
                                    <button
                                        type="submit"
                                        className="primary-button"
                                        disabled={profileSaving}
                                    >
                                        {profileSaving ? (
                                            <LoaderCircle size={17} />
                                        ) : (
                                            <Save size={17} />
                                        )}

                                        {profileSaving
                                            ? 'Menyimpan...'
                                            : 'Simpan Perubahan'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>

                    {/* ================================= */}
                    {/* BACKUP & RESTORE - IT SUPPORT ONLY */}
                    {/* ================================= */}

                    {isITSupport && (
                        <>
                            <section className="content-card settings-section">
                                <div className="settings-section-heading">
                                    <div className="settings-icon">
                                        <Database size={22} />
                                    </div>

                                    <div>
                                        <h2>Backup Database</h2>
                                        <p>
                                            Unduh salinan database MySQL dalam format SQL.
                                        </p>
                                    </div>
                                </div>

                                <div className="settings-info">
                                    <FileText size={18} />

                                    <div>
                                        <strong>Format file: .SQL</strong>
                                        <p>
                                            Backup mencakup struktur tabel dan data database.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="primary-button"
                                    onClick={exportDatabase}
                                    disabled={backupLoading || restoreLoading}
                                >
                                    {backupLoading ? (
                                        <LoaderCircle size={17} />
                                    ) : (
                                        <Download size={17} />
                                    )}

                                    {backupLoading
                                        ? 'Membuat Backup...'
                                        : 'Export Database'}
                                </button>
                            </section>

                            <section className="content-card settings-section">
                                <div className="settings-section-heading">
                                    <div className="settings-icon">
                                        <Upload size={22} />
                                    </div>

                                    <div>
                                        <h2>Restore Database</h2>
                                        <p>
                                            Pulihkan database dari file backup SQL.
                                        </p>
                                    </div>
                                </div>

                                <div className="settings-warning">
                                    <AlertTriangle size={19} />

                                    <div>
                                        <strong>Perhatian sebelum restore</strong>
                                        <p>
                                            Isi database saat ini akan diubah mengikuti
                                            file backup. Sistem akan mencoba membuat
                                            backup otomatis terlebih dahulu.
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={restoreDatabase}>
                                    <div className="form-field">
                                        <label htmlFor="backup-file">
                                            Pilih file backup SQL
                                        </label>

                                        <input
                                            id="backup-file"
                                            type="file"
                                            accept=".sql"
                                            onChange={(event) =>
                                                setFile(
                                                    event.target.files?.[0] || null
                                                )
                                            }
                                            required
                                        />

                                        <small>
                                            Maksimal ukuran file 100 MB.
                                        </small>
                                    </div>

                                    <div className="form-field">
                                        <label htmlFor="restore-password">
                                            Password akun IT Support
                                        </label>

                                        <input
                                            id="restore-password"
                                            type="password"
                                            value={password}
                                            onChange={(event) =>
                                                setPassword(event.target.value)
                                            }
                                            autoComplete="current-password"
                                            required
                                        />
                                    </div>

                                    <label className="settings-confirm">
                                        <input
                                            type="checkbox"
                                            checked={confirmed}
                                            onChange={(event) =>
                                                setConfirmed(event.target.checked)
                                            }
                                        />

                                        Saya memahami bahwa proses restore dapat
                                        mengubah data database saat ini.
                                    </label>

                                    <button
                                        type="submit"
                                        className="primary-button settings-restore-button"
                                        disabled={restoreLoading || backupLoading}
                                    >
                                        {restoreLoading ? (
                                            <LoaderCircle size={17} />
                                        ) : (
                                            <Upload size={17} />
                                        )}

                                        {restoreLoading
                                            ? 'Memulihkan Database...'
                                            : 'Restore Database'}
                                    </button>
                                </form>
                            </section>
                        </>
                    )}

                    <footer className="page-footer">
                        <span>Helpdesk Ticketing System</span>
                        <span>Versi 1.0.0</span>
                    </footer>
                </div>
            </main>
        </div>
    );
}
