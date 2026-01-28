'use client';

import { useState, useEffect } from 'react';
import { 
    Map, 
    Plus, 
    Trash2, 
    ToggleLeft, 
    ToggleRight, 
    Loader2, 
    AlertCircle,
    Calendar,
    Award
} from 'lucide-react';

interface DOTM {
    _id: string;
    icao: string;
    bonus_points: number;
    description: string;
    is_active: boolean;
    created_at: string;
}

export default function AdminDOTMPage() {
    const [dotms, setDotms] = useState<DOTM[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [icao, setIcao] = useState('');
    const [bonusPoints, setBonusPoints] = useState(1000);
    const [description, setDescription] = useState('');

    useEffect(() => {
        fetchDotms();
    }, []);

    const fetchDotms = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/dotm');
            const data = await res.json();
            if (res.ok) {
                setDotms(data.dotms || []);
            }
        } catch (error) {
            console.error('Failed to fetch DOTMs');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const res = await fetch('/api/admin/dotm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    icao: icao.toUpperCase(),
                    bonus_points: Number(bonusPoints),
                    description,
                    is_active: true // Auto-activate new one
                })
            });

            if (res.ok) {
                setIcao('');
                setBonusPoints(1000);
                setDescription('');
                fetchDotms();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to create DOTM');
            }
        } catch (error) {
            setError('Connection error');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (id: string, currentState: boolean) => {
        try {
            const res = await fetch('/api/admin/dotm', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    updates: { is_active: !currentState }
                })
            });

            if (res.ok) {
                fetchDotms();
            }
        } catch (error) {
            console.error('Failed to toggle status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this destination?')) return;

        try {
            const res = await fetch(`/api/admin/dotm?id=${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                fetchDotms();
            }
        } catch (error) {
            console.error('Failed to delete');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Map className="w-8 h-8 text-accent-gold" />
                    <div>
                        <h1 className="text-2xl font-bold text-white">Destination of the Month</h1>
                        <p className="text-gray-400">Manage featured destinations and bonus points</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Create Form */}
                <div className="glass-card p-6 h-fit">
                    <h2 className="text-lg font-semibold text-white mb-4">Add New DOTM</h2>
                    
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1">Airport ICAO</label>
                            <input
                                type="text"
                                maxLength={4}
                                placeholder="e.g. KJFK"
                                className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2 text-white font-mono uppercase focus:border-accent-gold outline-none"
                                value={icao}
                                onChange={(e) => setIcao(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1">Bonus Points</label>
                            <input
                                type="number"
                                min="0"
                                step="100"
                                className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent-gold outline-none"
                                value={bonusPoints}
                                onChange={(e) => setBonusPoints(Number(e.target.value))}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1">Description (Optional)</label>
                            <textarea
                                className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent-gold outline-none h-24 resize-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Why explore this destination?"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full btn-primary py-2 flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Set Active DOTM
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="lg:col-span-2 glass-card overflow-hidden">
                    <div className="p-4 bg-dark-700/50 border-b border-white/5">
                        <h2 className="text-white font-semibold flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            History
                        </h2>
                    </div>
                    
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-accent-gold" />
                            Loading...
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {dotms.map((dotm) => (
                                <div key={dotm._id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-mono font-bold text-lg border ${
                                            dotm.is_active 
                                                ? 'bg-accent-gold/20 text-accent-gold border-accent-gold/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]' 
                                                : 'bg-dark-800 text-gray-500 border-white/5'
                                        }`}>
                                            {dotm.icao}
                                        </div>
                                        <div>
                                            <p className="text-gray-300 text-sm">{dotm.description || 'No description'}</p>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-xs text-green-400 font-mono font-bold flex items-center gap-1">
                                                    <Award className="w-3 h-3" />
                                                    +{dotm.bonus_points} pts
                                                </span>
                                                <span className="text-xs text-gray-600">
                                                    Created: {new Date(dotm.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleToggleActive(dotm._id, dotm.is_active)}
                                            className={`p-2 rounded-lg transition-colors ${
                                                dotm.is_active ? 'text-green-400 hover:bg-green-500/10' : 'text-gray-500 hover:bg-white/10 hover:text-white'
                                            }`}
                                            title={dotm.is_active ? 'Deactivate' : 'Activate'}
                                        >
                                            {dotm.is_active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(dotm._id)}
                                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {dotms.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    No destinations configured yet.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
