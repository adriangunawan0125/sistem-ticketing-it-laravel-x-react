
import React from 'react';
import { useTickets } from '../hooks/useTickets';
import TicketCreateModal from '../components/tickets/TicketCreateModal';
import TicketTable from '../components/tickets/TicketTable';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import StatsGrid from '../components/dashboard/StatsGrid';
import {
    Ticket,
    Plus,
    Clock3,
    CircleCheck,
    CircleAlert,
} from 'lucide-react';

export default function Dashboard() {
    const {
        tickets,
        statistics,
        loading,
        error,
        createTicket,
        updateStatus,
    } = useTickets();

    const [showCreateForm, setShowCreateForm] = React.useState(false);

    const currentUser = window.currentUser;
    const isClient = currentUser?.role === 'client';

    const stats = [
        {
            label: 'Total Tiket',
            value: statistics.total,
            note: isClient ? 'Seluruh laporan saya' : 'Seluruh laporan klien',
            icon: Ticket,
        },
        {
            label: 'Menunggu',
            value: statistics.menunggu,
            note: 'Menunggu penanganan',
            icon: Clock3,
        },
        {
            label: 'Diproses',
            value: statistics.diproses,
            note: 'Sedang ditangani',
            icon: CircleAlert,
        },
        {
            label: 'Selesai',
            value: statistics.selesai,
            note: 'Laporan terselesaikan',
            icon: CircleCheck,
        },
    ];

    return (
        <div className="app-shell">
            <Sidebar currentUser={currentUser} />

            <main className="main-area">
                <Topbar />

                <div className="page-content">
                    <section className="page-heading">
                        <div>
                            <span className="eyebrow">
                                {isClient
                                    ? 'AREA KLIEN'
                                    : 'IT SUPPORT WORKSPACE'}
                            </span>

                            <h1>
                                {isClient
                                    ? 'Dashboard Saya'
                                    : 'Dashboard IT Support'}
                            </h1>

                            <p>
                                {isClient
                                    ? 'Buat laporan kendala IT dan pantau progres penanganannya.'
                                    : 'Pantau dan kelola laporan kendala IT dari seluruh klien.'}
                            </p>
                        </div>

                        {isClient && (
                            <button
                                type="button"
                                className="primary-button"
                                onClick={() => setShowCreateForm(true)}
                            >
                                <Plus size={17} />
                                Buat Tiket
                            </button>
                        )}
                    </section>

                    <StatsGrid stats={stats} />

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

            {isClient && showCreateForm && (
                <TicketCreateModal
                    onClose={() => setShowCreateForm(false)}
                    onSubmit={createTicket}
                />
            )}
        </div>
    );
}
