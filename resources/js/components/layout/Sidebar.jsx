import React from 'react';
import { LayoutDashboard, Ticket, Users, ChartNoAxesColumn, Settings, Headset } from 'lucide-react';

export default function Sidebar({ currentUser }) {
    return (
        <aside className="sidebar">
                <a className="brand" href="#">
                    <span className="brand-icon"><Headset size={20} /></span>
                    <span>Helpdesk<span className="brand-dot">.</span></span>
                </a>

                <div className="nav-section">
                    <span className="nav-heading">MENU UTAMA</span>
                    <a className="nav-link active" href="#">
                        <LayoutDashboard size={18} /> Dashboard
                    </a>
                    <a className="nav-link" href="#">
                        <Ticket size={18} /> Tiket
                        <span className="nav-count">12</span>
                    </a>
                    <a className="nav-link" href="#">
                        <Users size={18} /> Data Klien
                    </a>
                    <a className="nav-link" href="#">
                        <ChartNoAxesColumn size={18} /> Laporan
                    </a>
                </div>

                <div className="nav-section settings-nav">
                    <span className="nav-heading">PREFERENSI</span>
                    <a className="nav-link" href="#">
                        <Settings size={18} /> Pengaturan
                    </a>
                </div>

               
<div className="sidebar-footer">
    <div className="profile-avatar">
        {(currentUser?.name || 'User').charAt(0).toUpperCase()}
    </div>

    <div className="profile-info">
        <strong>{currentUser?.name || 'Pengguna'}</strong>
        <span>
            {currentUser?.role === 'it_support' ? 'IT Support' : 'Klien'}
        </span>
    </div>

    <form action="/logout" method="POST">
        <input
            type="hidden"
            name="_token"
            value={document.querySelector(
                'meta[name="csrf-token"]'
            )?.content || ''}
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
