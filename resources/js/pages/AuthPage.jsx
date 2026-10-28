import React from 'react';

export default function AuthPage() {
    const page = window.authPage || { type: 'login', errors: {} };
    const isRegister = page.type === 'register';
    const [errors, setErrors] = React.useState(page.errors || {});
    const [loading, setLoading] = React.useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);
        setErrors({});

        const form = new FormData(event.currentTarget);

        try {
            const response = await fetch(
                isRegister ? '/register' : '/login',
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': page.csrf,
                    },
                    body: form,
                    credentials: 'same-origin',
                }
            );

            const result = await response.json();

            if (response.ok) {
                window.location.href = result.redirect || '/';
                return;
            }

            if (response.status === 422) {
                setErrors(result.errors || {
                    email: [result.message || 'Periksa kembali data Anda.']
                });
            } else {
                setErrors({
                    general: [result.message || 'Terjadi kesalahan pada server.']
                });
            }
        } catch {
            setErrors({
                general: ['Tidak dapat terhubung ke server. Silakan coba lagi.']
            });
        } finally {
            setLoading(false);
        }
    }

    function fieldError(name) {
        return errors[name]?.[0];
    }

    return (
        <div className="auth-layout">
            <section className="auth-brand-panel">
                <div className="auth-brand">
                    <span className="auth-logo">H</span>
                    <span>Helpdesk<span className="brand-dot">.</span></span>
                </div>

                <div className="auth-brand-content">
                    <span className="auth-eyebrow">IT SERVICE MANAGEMENT</span>
                    <h1>Semua laporan IT, dalam satu tempat.</h1>
                    <p>
                        Laporkan kendala teknis, pantau progres penanganan,
                        dan dapatkan informasi penyelesaian melalui satu sistem.
                    </p>
                </div>

                <span className="auth-copyright">
                    Helpdesk Ticketing System
                </span>
            </section>

            <section className="auth-form-panel">
                <div className="auth-form-container">
                    <span className="auth-eyebrow">
                        {isRegister ? 'BUAT AKUN BARU' : 'SELAMAT DATANG KEMBALI'}
                    </span>

                    <h2>{isRegister ? 'Daftar akun' : 'Login ke akun Anda'}</h2>

                    <p className="auth-description">
                        {isRegister
                            ? 'Buat akun klien untuk mulai mengirim laporan.'
                            : 'Masukkan email dan password untuk melanjutkan.'}
                    </p>

                    {errors.general && (
                        <div className="auth-error">{errors.general[0]}</div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {isRegister && (
                            <div className="form-field">
                                <label htmlFor="name">Nama lengkap</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Masukkan nama lengkap"
                                    autoComplete="name"
                                    required
                                />
                                {fieldError('name') && (
                                    <span className="field-error">{fieldError('name')}</span>
                                )}
                            </div>
                        )}

                        <div className="form-field">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="nama@email.com"
                                autoComplete="email"
                                required
                            />
                            {fieldError('email') && (
                                <span className="field-error">{fieldError('email')}</span>
                            )}
                        </div>

                        <div className="form-field">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Minimal 8 karakter"
                                autoComplete={isRegister ? 'new-password' : 'current-password'}
                                required
                            />
                            {fieldError('password') && (
                                <span className="field-error">{fieldError('password')}</span>
                            )}
                        </div>

                        {isRegister && (
                            <div className="form-field">
                                <label htmlFor="password_confirmation">Konfirmasi password</label>
                                <input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type="password"
                                    placeholder="Ulangi password"
                                    autoComplete="new-password"
                                    required
                                />
                            </div>
                        )}

                        <button className="auth-submit" type="submit" disabled={loading}>
                            {loading
                                ? 'Memproses...'
                                : isRegister ? 'Buat Akun' : 'Login'}
                        </button>
                    </form>

                    <p className="auth-switch">
                        {isRegister ? 'Sudah memiliki akun?' : 'Belum memiliki akun?'}
                        {' '}
                        <a href={isRegister ? '/login' : '/register'}>
                            {isRegister ? 'Login' : 'Daftar sekarang'}
                        </a>
                    </p>
                </div>
            </section>
           
        </div>
    );
}
