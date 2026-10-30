
import React from 'react';
import {
    LayoutDashboard,
    Ticket,
    Users,
    ChartNoAxesColumn,
    Settings,
    Headset,
} from 'lucide-react';

import { confirmAction } from '../../utils/alerts';

export default function Sidebar({ currentUser: initialUser }) {
    const [currentUser, setCurrentUser] = React.useState(
        initialUser || window.currentUser || {}
    );

    const logoutFormRef = React.useRef(null);

    // Ambil profil terbaru dari server saat komponen dimuat
    React.useEffect(() => {
        let active = true;

        async function loadProfile() {
            try {
                const response = await fetch('/api/profile', {
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Gagal mengambil profil.');
                }

                const data = await response.json();

                if (active && data.user) {
                    setCurrentUser(data.user);
                    window.currentUser = {
                        ...window.currentUser,
                        ...data.user,
                    };
                }
            } catch (error) {
                console.error('Sidebar profile:', error);
            }
        }

        loadProfile();

        return () => {
            active = false;
        };
    }, []);

    // Dengarkan perubahan profil dari halaman Settings
    React.useEffect(() => {
        const handleProfileUpdate = (event) => {
            if (!event.detail) return;

            setCurrentUser((previous) => ({
                ...previous,
                ...event.detail,
            }));
        };

        window.addEventListener('profile:updated', handleProfileUpdate);

        return () => {
            window.removeEventListener(
                'profile:updated',
                handleProfileUpdate
            );
        };
    }, []);

    const isITSupport = currentUser?.role === 'it_support';
    const isClient = currentUser?.role === 'client';

    const menuItems = [
        {
            label: 'Dashboard',
            href: isITSupport
                ? '/it-support/dashboard'
                : '/client/dashboard',
            icon: LayoutDashboard,
        },
        ...(isITSupport
            ? [
                  {
                      label: 'Semua Tiket',
                      href: '/it-support/tickets',
                      icon: Ticket,
                  },
                  {
                      label: 'Data Klien',
                      href: '/it-support/clients',
                      icon: Users,
                  },
                  {
                      label: 'Laporan',
                      href: '/it-support/reports',
                      icon: ChartNoAxesColumn,
                  },
              ]
            : []),
        ...(isClient
            ? [
                  {
                      label: 'Tiket Saya',
                      href: '/client/tickets',
                      icon: Ticket,
                  },
              ]
            : []),
    ];

    async function handleLogout() {
        const confirmed = await confirmAction({
            title: 'Keluar dari aplikasi?',
            text: 'Apakah Anda yakin ingin mengakhiri sesi login?',
            confirmText: 'Ya, Keluar',
            cancelText: 'Batal',
            icon: 'warning',
        });

        if (confirmed) {
            logoutFormRef.current?.submit();
        }
    }

    const settingsHref = isITSupport
        ? '/it-support/settings'
        : '/client/settings';

    return (
        <aside className="sidebar">
            <a
                className="brand"
                href={
                    isITSupport
                        ? '/it-support/dashboard'
                        : '/client/dashboard'
                }
            >
                <span className="brand-icon">
                    <Headset size={20} />
                </span>

                <span>
                    Helpdesk<span className="brand-dot">.</span>
                </span>
            </a>

            <div className="nav-section">
                <span className="nav-heading">MENU UTAMA</span>

                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active =
                        window.location.pathname === item.href;

                    return (
                        <a
                            key={item.label}
                            className={`nav-link${active ? ' active' : ''}`}
                            href={item.href}
                        >
                            <Icon size={18} />
                            {item.label}
                        </a>
                    );
                })}
            </div>

            {(isITSupport || isClient) && (
                <div className="nav-section settings-nav">
                    <span className="nav-heading">PREFERENSI</span>

                    <a
                        className={`nav-link${
                            window.location.pathname === settingsHref
                                ? ' active'
                                : ''
                        }`}
                        href={settingsHref}
                    >
                        <Settings size={18} />
                        Pengaturan
                    </a>
                </div>
            )}

            <div className="sidebar-footer">
                <div className="profile-avatar">
                    {currentUser?.profile_photo ? (
                        <img
                            src={currentUser.profile_photo}
                            alt="Foto Profil"
                            onError={(event) => {
                                event.currentTarget.style.display = 'none';
                            }}
                        />
                    ) : (
                        (currentUser?.name || 'U')
                            .charAt(0)
                            .toUpperCase()
                    )}
                </div>

                <div className="profile-info">
                    <strong>{currentUser?.name || 'Pengguna'}</strong>
                    <span>
                        {isITSupport ? 'IT Support' : 'Klien'}
                    </span>
                </div>

                <form
                    ref={logoutFormRef}
                    action="/logout"
                    method="POST"
                >
                    <input
                        type="hidden"
                        name="_token"
                        value={
                            document.querySelector(
                                'meta[name="csrf-token"]'
                            )?.content || ''
                        }
                    />

                    <button
                        type="button"
                        className="logout-button"
                        title="Logout"
                        aria-label="Logout"
                        onClick={handleLogout}
                    >
                        Keluar
                    </button>
                </form>
            </div>
        </aside>
    );
}
