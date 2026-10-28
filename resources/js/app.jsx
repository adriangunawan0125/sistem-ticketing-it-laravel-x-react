
import React from 'react';
import { createRoot } from 'react-dom/client';
import {
    LayoutDashboard, Ticket, Users, ChartNoAxesColumn,
    Settings, Search, Bell, Plus, ArrowUpRight,
    Clock3, CircleCheck, CircleAlert, Headset,
    ChevronDown, ArrowRight
} from 'lucide-react';
import '../css/app.css';

const stats = [
    { label: 'Total Tiket', value: '128', note: 'Seluruh laporan', icon: Ticket },
    { label: 'Menunggu', value: '12', note: 'Perlu ditinjau', icon: Clock3 },
    { label: 'Sedang Diproses', value: '18', note: 'Dalam penanganan', icon: CircleAlert },
    { label: 'Selesai', value: '98', note: 'Berhasil diselesaikan', icon: CircleCheck },
];

const tickets = [
    { id: 'TCK-2026-0128', title: 'Komputer tidak dapat terhubung ke jaringan', client: 'Budi Santoso', category: 'Jaringan', priority: 'Tinggi', status: 'Menunggu', date: '28 Okt 2026' },
    { id: 'TCK-2026-0127', title: 'Printer tidak merespons perintah cetak', client: 'Siti Aminah', category: 'Perangkat Keras', priority: 'Sedang', status: 'Diproses', date: '28 Okt 2026' },
    { id: 'TCK-2026-0126', title: 'Permintaan instalasi aplikasi kantor', client: 'Andi Pratama', category: 'Software', priority: 'Rendah', status: 'Selesai', date: '27 Okt 2026' },
    { id: 'TCK-2026-0125', title: 'Akun tidak dapat mengakses sistem', client: 'Dina Putri', category: 'Akun & Akses', priority: 'Tinggi', status: 'Diproses', date: '27 Okt 2026' },
];

function App() {
    return (
        <div className="app-shell">
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
                    <div className="profile-avatar">IT</div>
                    <div className="profile-info">
                        <strong>IT Support</strong>
                        <span>Administrator</span>
                    </div>
                    <ChevronDown size={16} className="profile-chevron" />
                </div>
            </aside>

            <main className="main-area">
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

                <div className="page-content">
                    <section className="page-heading">
                        <div>
                            <span className="eyebrow">OVERVIEW</span>
                            <h1>Dashboard</h1>
                            <p>Pantau dan kelola seluruh laporan IT Support.</p>
                        </div>
                        <button className="primary-button">
                            <Plus size={17} /> Buat Tiket
                        </button>
                    </section>

                    <section className="stats-grid">
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <article className="stat-card" key={stat.label}>
                                    <div className="stat-top">
                                        <span className="stat-label">{stat.label}</span>
                                        <span className="stat-icon"><Icon size={19} /></span>
                                    </div>
                                    <div className="stat-value">{stat.value}</div>
                                    <div className="stat-note">{stat.note}</div>
                                </article>
                            );
                        })}
                    </section>

                    <section className="content-card">
                        <div className="card-heading">
                            <div>
                                <h2>Tiket Terbaru</h2>
                                <p>Daftar laporan yang masuk ke sistem.</p>
                            </div>
                            <button className="secondary-button">
                                Lihat semua <ArrowRight size={15} />
                            </button>
                        </div>

                        <div className="filter-row">
                            <div className="search-field">
                                <Search size={16} />
                                <input placeholder="Cari nomor tiket atau masalah..." />
                            </div>
                            <button className="filter-button">
                                Semua Status <ChevronDown size={15} />
                            </button>
                        </div>

                        <div className="table-container">
                            <table className="ticket-table">
                                <thead>
                                    <tr>
                                        <th>INFORMASI TIKET</th>
                                        <th>KLIEN</th>
                                        <th>KATEGORI</th>
                                        <th>PRIORITAS</th>
                                        <th>STATUS</th>
                                        <th>TANGGAL</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.map((ticket) => (
                                        <tr key={ticket.id}>
                                            <td>
                                                <div className="ticket-title">{ticket.title}</div>
                                                <div className="ticket-id">{ticket.id}</div>
                                            </td>
                                            <td>{ticket.client}</td>
                                            <td><span className="category-label">{ticket.category}</span></td>
                                            <td>
                                                <span className={`priority priority-${ticket.priority.toLowerCase()}`}>
                                                    <span />{ticket.priority}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status status-${ticket.status.toLowerCase()}`}>
                                                    {ticket.status}
                                                </span>
                                            </td>
                                            <td className="date-cell">{ticket.date}</td>
                                            <td>
                                                <button className="row-action" aria-label="Detail tiket">
                                                    <ArrowUpRight size={17} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="table-footer">
                            <span>Menampilkan 4 dari 128 tiket</span>
                            <div className="pagination">
                                <button disabled>Sebelumnya</button>
                                <button className="page-number">1</button>
                                <button>2</button>
                                <button>3</button>
                                <button>Selanjutnya</button>
                            </div>
                        </div>
                    </section>

                    <footer className="page-footer">
                        <span>Helpdesk Ticketing System</span>
                        <span>Versi 1.0.0</span>
                    </footer>
                </div>
            </main>
        </div>
    );
}

createRoot(document.getElementById('app')).render(<App />);
