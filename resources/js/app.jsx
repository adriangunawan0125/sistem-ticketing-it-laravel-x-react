import React from 'react';
import { createRoot } from 'react-dom/client';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';
import '../css/app.css';

const root = createRoot(document.getElementById('app'));

if (window.authPage) {
    root.render(<AuthPage />);
} else {
    root.render(<Dashboard />);
}
