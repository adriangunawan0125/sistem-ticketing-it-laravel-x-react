
import React from 'react';
import {
    Search,
    Bell,
    CheckCheck,
    Ticket,
    X,
} from 'lucide-react';

import { showError } from '../../utils/alerts';

export default function Topbar() {
    const [notifications, setNotifications] = React.useState([]);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const [currentUser, setCurrentUser] = React.useState(
        window.currentUser || {}
    );

    const dropdownRef = React.useRef(null);

    const csrfToken =
        document.querySelector('meta[name="csrf-token"]')?.content || '';

    // Ambil data profil langsung dari server
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
                console.error('Topbar profile:', error);
            }
        }

        loadProfile();

        return () => {
            active = false;
        };
    }, []);

    // Dengarkan perubahan profil dari Settings
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

    const fetchNotifications = React.useCallback(async () => {
        try {
            const response = await fetch('/api/notifications', {
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Gagal mengambil notifikasi.');
            }

            const data = await response.json();

            setNotifications(data.notifications || []);
            setUnreadCount(data.unread_count || 0);
        } catch (error) {
            console.error(error);
        }
    }, []);

    React.useEffect(() => {
        fetchNotifications();

        const interval = setInterval(fetchNotifications, 10000);

        return () => clearInterval(interval);
    }, [fetchNotifications]);

    React.useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener(
                'mousedown',
                handleClickOutside
            );
        };
    }, []);

    async function markAsRead(notification) {
        if (notification.read_at) {
            openTicket(notification);
            return;
        }

        try {
            const response = await fetch(
                `/api/notifications/${notification.id}/read`,
                {
                    method: 'PATCH',
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Gagal memperbarui notifikasi.');
            }

            await fetchNotifications();

            openTicket(notification);
        } catch (error) {
            showError('Gagal', error.message);
        }
    }

    function openTicket(notification) {
        const ticketId = notification.data?.ticket_id;

        if (!ticketId) return;

        setOpen(false);

        window.location.href =
            window.location.pathname.startsWith('/it-support')
                ? '/it-support/tickets'
                : '/client/dashboard';
    }

    async function markAllAsRead() {
        if (unreadCount === 0) return;

        setLoading(true);

        try {
            const response = await fetch(
                '/api/notifications/read-all',
                {
                    method: 'PATCH',
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Gagal menandai notifikasi.');
            }

            await fetchNotifications();
        } catch (error) {
            showError('Gagal', error.message);
        } finally {
            setLoading(false);
        }
    }

    function formatDate(date) {
        if (!date) return '';

        return new Date(date).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    return (
        <header className="topbar">
            <div className="breadcrumb">
                Workspace <span>/</span>{' '}
                <strong>
                    {window.location.pathname.includes('dashboard')
                        ? 'Dashboard'
                        : window.location.pathname.split('/').pop()}
                </strong>
            </div>

            <div className="topbar-actions">
                <button
                    type="button"
                    className="icon-button"
                    aria-label="Cari"
                >
                    <Search size={18} />
                </button>

                <div className="notification-wrapper" ref={dropdownRef}>
                    <button
                        type="button"
                        className="icon-button notification-button"
                        aria-label="Notifikasi"
                        aria-expanded={open}
                        onClick={() => setOpen((previous) => !previous)}
                    >
                        <Bell size={19} />

                        {unreadCount > 0 && (
                            <span className="notification-badge">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {open && (
                        <div className="notification-dropdown">
                            <div className="notification-header">
                                <div>
                                    <h3>Notifikasi</h3>
                                    <span>
                                        {unreadCount} belum dibaca
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className="notification-close"
                                    onClick={() => setOpen(false)}
                                    aria-label="Tutup notifikasi"
                                >
                                    <X size={17} />
                                </button>
                            </div>

                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    className="notification-read-all"
                                    onClick={markAllAsRead}
                                    disabled={loading}
                                >
                                    <CheckCheck size={15} />
                                    {loading
                                        ? 'Memproses...'
                                        : 'Tandai semua dibaca'}
                                </button>
                            )}

                            <div className="notification-list">
                                {notifications.length === 0 ? (
                                    <div className="notification-empty">
                                        <Bell size={25} />
                                        <strong>Belum ada notifikasi</strong>
                                        <span>
                                            Notifikasi baru akan muncul di sini.
                                        </span>
                                    </div>
                                ) : (
                                    notifications.map((notification) => (
                                        <button
                                            type="button"
                                            key={notification.id}
                                            className={`notification-item ${
                                                !notification.read_at
                                                    ? 'unread'
                                                    : ''
                                            }`}
                                            onClick={() =>
                                                markAsRead(notification)
                                            }
                                        >
                                            <span className="notification-icon">
                                                <Ticket size={17} />
                                            </span>

                                            <span className="notification-content">
                                                <strong>
                                                    {notification.data?.title ||
                                                        'Notifikasi tiket'}
                                                </strong>

                                                <span>
                                                    {notification.data?.message}
                                                </span>

                                                <small>
                                                    {formatDate(
                                                        notification.created_at
                                                    )}
                                                </small>
                                            </span>

                                            {!notification.read_at && (
                                                <span className="notification-unread-dot" />
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="topbar-divider" />

                <div className="mini-avatar">
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
            </div>
        </header>
    );
}
