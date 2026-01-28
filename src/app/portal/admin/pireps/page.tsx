'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, XCircle, AlertCircle, Info, MessageSquare } from 'lucide-react';

interface PIREP {
    _id: string;
    pilot_name: string;
    flight_number: string;
    callsign: string;
    departure_icao: string;
    arrival_icao: string;
    aircraft_type: string;
    flight_time: number;
    landing_rate: number;
    score: number;
    approved_status: number; // 0=Pending, 1=Approved, 2=Rejected
    submitted_at: string;
    comments?: string;
    admin_comments?: string;
}

export default function AdminPirepsPage() {
    const [pireps, setPireps] = useState<PIREP[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPirep, setSelectedPirep] = useState<PIREP | null>(null);
    const [adminComment, setAdminComment] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchPireps();
    }, [statusFilter]);

    const fetchPireps = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/pireps?status=${statusFilter}`);
            const data = await res.json();
            if (data.pireps) {
                setPireps(data.pireps);
            }
        } catch (error) {
            console.error('Error fetching PIREPs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (id: string, status: number) => {
        setProcessing(true);
        try {
            const res = await fetch(`/api/admin/pireps/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    approved_status: status,
                    admin_comments: adminComment
                })
            });

            if (res.ok) {
                setSelectedPirep(null);
                setAdminComment('');
                fetchPireps();
            }
        } catch (error) {
            console.error('Error reviewing PIREP:', error);
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status: number) => {
        switch (status) {
            case 0: return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded">PENDING</span>;
            case 1: return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">APPROVED</span>;
            case 2: return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded">REJECTED</span>;
            default: return null;
        }
    };

    const filteredPireps = pireps.filter(p => 
        p.callsign.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.pilot_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <CheckCircle className="text-accent-gold w-8 h-8" />
                PIREP Management
            </h1>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-2">
                    {['pending', 'approved', 'rejected', 'all'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                statusFilter === s 
                                ? 'bg-accent-gold text-dark-900 shadow-lg' 
                                : 'bg-dark-700 text-gray-400 hover:text-white border border-white/5'
                            }`}
                        >
                            {s.toUpperCase()}
                        </button>
                    ))}
                </div>
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by Pilot or Callsign..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.currentTarget.value)}
                        className="w-full bg-dark-700 border border-white/5 rounded-lg pl-10 pr-4 py-2 text-white focus:border-accent-gold outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Pilot</th>
                            <th className="px-6 py-4">Flight</th>
                            <th className="px-6 py-4">Rate</th>
                            <th className="px-6 py-4">Score</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 animate-pulse">
                                    Loading flight reports...
                                </td>
                            </tr>
                        ) : filteredPireps.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    No flight reports found.
                                </td>
                            </tr>
                        ) : filteredPireps.map(p => (
                            <tr key={p._id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <p className="text-white font-medium">{p.pilot_name}</p>
                                    <p className="text-xs text-gray-500">{p.aircraft_type}</p>
                                </td>
                                <td className="px-6 py-4 text-accent-gold font-mono font-bold">
                                    {p.callsign}
                                    <span className="block text-[10px] text-gray-500 uppercase">{p.departure_icao} ➜ {p.arrival_icao}</span>
                                </td>
                                <td className={`px-6 py-4 font-mono ${p.landing_rate < -500 ? 'text-red-400' : 'text-gray-300'}`}>
                                    {p.landing_rate} fpm
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`font-bold ${p.score < 80 ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {p.score}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-400">
                                    {new Date(p.submitted_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => setSelectedPirep(p)}
                                        className="text-xs bg-white/10 hover:bg-accent-gold hover:text-dark-900 px-3 py-1 rounded transition-all font-bold"
                                    >
                                        REVIEW
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {selectedPirep && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedPirep(null)} />
                    <div className="relative w-full max-w-2xl bg-dark-800 border border-white/10 rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-white">{selectedPirep.callsign}</h3>
                                <p className="text-gray-400">{selectedPirep.pilot_name} • {selectedPirep.aircraft_type}</p>
                            </div>
                            {getStatusBadge(selectedPirep.approved_status)}
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="bg-dark-700/50 p-4 rounded-xl">
                                <p className="text-xs text-gray-500 uppercase mb-1">Flight Time</p>
                                <p className="text-xl text-white font-mono">{Math.floor(selectedPirep.flight_time / 60)}h {selectedPirep.flight_time % 60}m</p>
                            </div>
                            <div className="bg-dark-700/50 p-4 rounded-xl">
                                <p className="text-xs text-gray-500 uppercase mb-1">Landing Rate</p>
                                <p className={`text-xl font-mono ${selectedPirep.landing_rate < -500 ? 'text-red-400' : 'text-emerald-400'}`}>{selectedPirep.landing_rate} fpm</p>
                            </div>
                        </div>

                        {selectedPirep.comments && (
                            <div className="mb-6">
                                <p className="text-xs text-gray-500 uppercase mb-2 flex items-center gap-1">
                                    <MessageSquare size={12} /> Pilot Comments
                                </p>
                                <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-gray-300 italic">
                                    "{selectedPirep.comments}"
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <label className="block text-xs text-gray-500 uppercase">Admin Verdict & Comments</label>
                            <textarea
                                value={adminComment}
                                onChange={(e) => setAdminComment(e.currentTarget.value)}
                                className="w-full bg-dark-700 border border-white/10 rounded-xl p-4 text-white focus:border-accent-gold outline-none h-24 text-sm"
                                placeholder="Reason for approval/rejection..."
                            />
                            
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => handleReview(selectedPirep._id, 1)}
                                    disabled={processing}
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={18} /> APPROVE
                                </button>
                                <button
                                    onClick={() => handleReview(selectedPirep._id, 2)}
                                    disabled={processing}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <XCircle size={18} /> REJECT
                                </button>
                                <button
                                    onClick={() => setSelectedPirep(null)}
                                    disabled={processing}
                                    className="px-6 py-3 bg-dark-700 text-gray-400 hover:text-white rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
