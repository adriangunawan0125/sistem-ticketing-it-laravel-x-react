
import React from 'react';
import { createRoot } from 'react-dom/client';
import Dashboard from './pages/Dashboard';
import AllTickets from './pages/AllTickets';
import Reports from './pages/Reports';
import Clients from './pages/Clients';
import AuthPage from './pages/AuthPage';
import '../css/app.css';

const root = createRoot(document.getElementById('app'));
const currentPath = window.location.pathname;

if (window.authPage) {
    root.render(<AuthPage />);
} else if (currentPath === '/it-support/tickets') {
    root.render(<AllTickets />);
} else if (currentPath === '/it-support/clients') {
    root.render(<Clients />);
} else if (currentPath === '/it-support/reports') {
    root.render(<Reports />);
} else {
    root.render(<Dashboard />);
}

