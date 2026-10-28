
import React from 'react';
import {
    LayoutDashboard,
    Ticket,
    Users,
    ChartNoAxesColumn,
    Settings,
    Headset,
} from 'lucide-react';

export default function Sidebar({ currentUser }) {
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
                    href: '/client/dashboard',
                    icon: Ticket,
                },
            ]
            : []),
    ];

    return (
        <aside className="sidebar">
            <a
                className="brand"
                href={isITSupport ? '/it-support/dashboard' : '/client/dashboard'}
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
                const currentPath = window.location.pathname;
                const active = currentPath === item.href;

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

            {isITSupport && (
                <div className="nav-section settings-nav">
                    <span className="nav-heading">PREFERENSI</span>

                    <a className="nav-link" href="#pengaturan">
                        <Settings size={18} />
                        Pengaturan
                    </a>
                </div>
            )}

            <div className="sidebar-footer">
                <div className="profile-avatar">
                    {(currentUser?.name || 'U').charAt(0).toUpperCase()}
                </div>

                <div className="profile-info">
                    <strong>{currentUser?.name || 'Pengguna'}</strong>
                    <span>{isITSupport ? 'IT Support' : 'Klien'}</span>
                </div>

                <form action="/logout" method="POST">
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
                        type="submit"
                        className="logout-button"
                        title="Logout"
                        aria-label="Logout"
                    >
                        Keluar
                    </button>
                </form>
            </div>
        </aside>
    );
}
