import { useCallback, useEffect, useRef, useState } from 'react';
import { showToast } from '../utils/alerts';
const EMPTY_STATS = { total: 0, menunggu: 0, diproses: 0, selesai: 0 };

async function readJson(response) {
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        const firstError = payload.errors && Object.values(payload.errors)[0]?.[0];
        throw new Error(firstError || payload.message || 'Permintaan ke server gagal.');
    }
    return payload;
}

export function useTickets(refreshInterval = 8000) {
    const [tickets, setTickets] = useState([]);
    const [statistics, setStatistics] = useState(EMPTY_STATS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const requestInProgress = useRef(false);
    const firstLoad = useRef(true);

    const refresh = useCallback(async ({ silent = false } = {}) => {
        if (requestInProgress.current) return;
        requestInProgress.current = true;
        if (!silent && firstLoad.current) setLoading(true);

        try {
            const [ticketResponse, statsResponse] = await Promise.all([
                fetch('/api/tickets', {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                }),
                fetch('/api/ticket-statistics', {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                }),
            ]);
            const [ticketPayload, statsPayload] = await Promise.all([
                readJson(ticketResponse), readJson(statsResponse),
            ]);

            const nextTickets = Array.isArray(ticketPayload)
                ? ticketPayload
                : (ticketPayload.tickets ?? ticketPayload.data ?? []);
            const nextStats = statsPayload.statistics ?? statsPayload;

            setTickets(nextTickets);
            setStatistics({
                total: Number(nextStats.total ?? 0),
                menunggu: Number(nextStats.menunggu ?? 0),
                diproses: Number(nextStats.diproses ?? 0),
                selesai: Number(nextStats.selesai ?? 0),
            });
            setError('');
            firstLoad.current = false;
        } catch (err) {
            // Jangan menghilangkan data yang sudah tampil saat polling gagal sesaat.
            if (firstLoad.current || !silent) setError(err.message || 'Gagal memuat tiket.');
        } finally {
            setLoading(false);
            requestInProgress.current = false;
        }
    }, []);

    useEffect(() => {
        refresh();
        const timer = window.setInterval(() => refresh({ silent: true }), refreshInterval);
        return () => window.clearInterval(timer);
    }, [refresh, refreshInterval]);

    const createTicket = useCallback(async (data) => {
        const token = document.querySelector('meta[name="csrf-token"]')?.content;
        const response = await fetch('/api/tickets', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': token || '',
            },
            credentials: 'same-origin',
            body: JSON.stringify(data),
        });
        const result = await readJson(response);
        await refresh();
        showToast('Tiket berhasil dibuat.');
        return result;
    }, [refresh]);

    const updateStatus = useCallback(async (id, data) => {
        const token = document.querySelector('meta[name="csrf-token"]')?.content;
        const response = await fetch(`/api/tickets/${id}/status`, {
            method: 'PATCH',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': token || '',
            },
            credentials: 'same-origin',
            body: JSON.stringify(data),
        });
        const result = await readJson(response);
        await refresh();
        showToast('Status tiket berhasil diperbarui.');
        return result;
    }, [refresh]);

    return { tickets, statistics, loading, error, refresh, createTicket, updateStatus };
}
