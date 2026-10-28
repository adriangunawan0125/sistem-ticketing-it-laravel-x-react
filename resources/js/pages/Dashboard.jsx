import React from 'react';
import { useTickets } from '../hooks/useTickets';
import TicketCreateModal from '../components/tickets/TicketCreateModal';
import TicketTable from '../components/tickets/TicketTable';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import StatsGrid from '../components/dashboard/StatsGrid';
import {
    Ticket, Plus, Clock3, CircleCheck, CircleAlert
} from 'lucide-react';

export default function Dashboard() {
   const {
    tickets,
    statistics,
    loading,
    error,
    createTicket,
} = useTickets();

const [showCreateForm, setShowCreateForm] = React.useState(false);
const currentUser = window.currentUser;
const isClient = currentUser?.role === 'client';

    const stats = [
        {
            label: 'Total Tiket',
            value: statistics.total,
            note: 'Seluruh laporan',
            icon: Ticket,
        },
        {
            label: 'Menunggu',
            value: statistics.menunggu,
            note: 'Perlu ditinjau',
            icon: Clock3,
        },
        {
            label: 'Sedang Diproses',
            value: statistics.diproses,
            note: 'Dalam penanganan',
            icon: CircleAlert,
        },
        {
            label: 'Selesai',
            value: statistics.selesai,
            note: 'Berhasil diselesaikan',
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
                            <span className="eyebrow">OVERVIEW</span>
                            <h1>Dashboard</h1>
                            <p>Pantau dan kelola seluruh laporan IT Support.</p>
                        </div>
                      {isClient && (
    <button
        className="primary-button"
        onClick={() => setShowCreateForm(true)}
    >
        <Plus size={17} /> Buat Tiket
    </button>
)}
                    </section>

                    <StatsGrid stats={stats} />

                    <TicketTable tickets={tickets} loading={loading} error={error} />

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
