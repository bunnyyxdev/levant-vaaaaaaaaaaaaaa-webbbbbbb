'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Search, Trash2, Eye, Edit, ChevronLeft, ChevronRight } from 'lucide-react';

interface Pirep {
    _id: string;
    flight_number: string;
    callsign: string;
    pilot_id: string;
    departure_icao: string;
    arrival_icao: string;
    duration?: string;
    approved_status: number; // 0=pending, 1=approved, 2=denied
    flight_type?: string;
    created_at: string;
}

export default function AdminPirepsPage() {
    const [pireps, setPireps] = useState<Pirep[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchPireps();
    }, [page, statusFilter]);

    const fetchPireps = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', page.toString());
            params.set('limit', '20');
            if (statusFilter) params.set('status', statusFilter);
            if (search) params.set('search', search);

            const res = await fetch(`/api/admin/pireps?${params}`);
            const data = await res.json();
            setPireps(data.pireps || []);
            setPagination(data.pagination || { total: 0, pages: 1 });
        } catch (err) {
            console.error('Error fetching PIREPs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchPireps();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this PIREP?')) return;

        try {
            const res = await fetch(`/api/admin/pireps?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMessage({ type: 'success', text: 'PIREP deleted successfully' });
                fetchPireps();
            } else {
                setMessage({ type: 'error', text: 'Failed to delete PIREP' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to delete PIREP' });
        }
    };

    const getStatusBadge = (status: number) => {
        switch (status) {
            case 0: return <span className="px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-400">Pending</span>;
            case 1: return <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">Approved</span>;
            case 2: return <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400">Denied</span>;
            default: return <span className="px-2 py-1 rounded text-xs bg-gray-500/20 text-gray-400">Unknown</span>;
        }
    };

    const getTypeBadge = (type?: string) => {
        switch (type) {
            case 'activity': return <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400">Tour/Event</span>;
            case 'scheduled': return <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400">Scheduled</span>;
            default: return <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400">Charter</span>;
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FileText className="w-8 h-8 text-accent-gold" />
                        PIREP Management
                    </h1>
                    <p className="text-gray-400 mt-1">Manage and review pilot reports</p>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {message.text}
                </div>
            )}

            {/* Filters */}
            <div className="glass-card p-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search flight number or pilot ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-dark-700 border border-white/10 rounded pl-10 pr-4 py-2 text-white text-sm"
                            />
                        </div>
                        <button type="submit" className="bg-accent-gold hover:bg-accent-gold/80 text-dark-900 px-4 py-2 rounded font-medium text-sm">
                            Search
                        </button>
                    </form>

                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="bg-dark-700 border border-white/10 rounded px-3 py-2 text-white text-sm"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="denied">Denied</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full" />
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-400 border-b border-white/5 bg-dark-800/50">
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Flight #</th>
                                    <th className="p-4">Pilot ID</th>
                                    <th className="p-4">Route</th>
                                    <th className="p-4">Duration</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pireps.map((pirep) => (
                                    <tr key={pirep._id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="p-4 text-gray-400">
                                            {new Date(pirep.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-white font-mono">{pirep.flight_number}</td>
                                        <td className="p-4 text-accent-gold font-mono">{pirep.callsign}</td>
                                        <td className="p-4 text-white">
                                            <span className="font-mono">{pirep.departure_icao}</span>
                                            <span className="text-gray-500 mx-2">→</span>
                                            <span className="font-mono">{pirep.arrival_icao}</span>
                                        </td>
                                        <td className="p-4 text-gray-400">{pirep.duration || '-'}</td>
                                        <td className="p-4">{getStatusBadge(pirep.approved_status)}</td>
                                        <td className="p-4">{getTypeBadge(pirep.flight_type)}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/portal/admin/pireps/${pirep._id}`}
                                                    className="p-2 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(pirep._id)}
                                                    className="p-2 hover:bg-red-500/10 rounded transition-colors text-gray-400 hover:text-red-400"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {pireps.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-gray-500">
                                            No PIREPs found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-white/10">
                        <span className="text-gray-500 text-sm">
                            Showing {pireps.length} of {pagination.total} PIREPs
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded bg-dark-700 text-gray-400 hover:text-white disabled:opacity-50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-gray-400 text-sm">
                                Page {page} of {pagination.pages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                disabled={page === pagination.pages}
                                className="p-2 rounded bg-dark-700 text-gray-400 hover:text-white disabled:opacity-50"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
