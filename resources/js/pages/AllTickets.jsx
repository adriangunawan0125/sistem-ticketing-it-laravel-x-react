
import React from 'react';
import { useTickets } from '../hooks/useTickets';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import TicketTable from '../components/tickets/TicketTable';
import { ArrowLeft } from 'lucide-react';

export default function AllTickets() {
    const {
        tickets,
        loading,
        error,
        updateStatus,
    } = useTickets();

    const currentUser = window.currentUser;

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

                            <h1>Semua Tiket</h1>

                            <p>
                                Lihat, cari, filter, dan kelola laporan
                                kendala IT dari seluruh klien.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() => {
                                window.location.href =
                                    '/it-support/dashboard';
                            }}
                        >
                            <ArrowLeft size={16} />
                            Kembali ke Dashboard
                        </button>
                    </section>

                    <TicketTable
                        tickets={tickets}
                        loading={loading}
                        error={error}
                        onUpdateStatus={updateStatus}
                    />

                    <footer className="page-footer">
                        <span>Helpdesk Ticketing System</span>
                        <span>Versi 1.0.0</span>
                    </footer>
                </div>
            </main>
        </div>
    );
}
