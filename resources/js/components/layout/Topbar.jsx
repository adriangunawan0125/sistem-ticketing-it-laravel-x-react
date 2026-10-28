import React from 'react';
import { Search, Bell } from 'lucide-react';

export default function Topbar() {
    return (
                <header className="topbar">
                    <div className="breadcrumb">
                        Workspace <span>/</span> <strong>Dashboard</strong>
                    </div>
                    <div className="topbar-actions">
                        <button className="icon-button" aria-label="Cari">
                            <Search size={18} />
                        </button>
                        <button className="icon-button notification-button" aria-label="Notifikasi">
                            <Bell size={18} />
                            <span className="notification-dot" />
                        </button>
                        <div className="topbar-divider" />
                        <div className="mini-avatar">IT</div>
                    </div>
                </header>
    );
}
