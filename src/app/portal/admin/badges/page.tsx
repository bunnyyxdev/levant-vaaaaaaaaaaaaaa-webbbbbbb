'use client';
import { useState, useEffect } from 'react';
import { Award, Plus, Trash2, Search, User } from 'lucide-react';

export default function BadgeManagementPage() {
    const [awards, setAwards] = useState<any[]>([]);
    const [pilots, setPilots] = useState<any[]>([]);
    const [pilotAwards, setPilotAwards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Assign form state
    const [selectedPilot, setSelectedPilot] = useState('');
    const [selectedAward, setSelectedAward] = useState('');
    const [searchPilot, setSearchPilot] = useState('');
    const [assigning, setAssigning] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/admin/badges');
            const data = await res.json();
            setAwards(data.awards || []);
            setPilots(data.pilots || []);
            setPilotAwards(data.pilotAwards || []);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedPilot || !selectedAward) {
            setMessage({ type: 'error', text: 'Please select both a pilot and a badge' });
            return;
        }

        setAssigning(true);
        try {
            const res = await fetch('/api/admin/badges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pilotId: selectedPilot, awardId: selectedAward })
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Badge assigned successfully!' });
                setSelectedPilot('');
                setSelectedAward('');
                fetchData();
            } else {
                const err = await res.json();
                setMessage({ type: 'error', text: err.error || 'Failed to assign badge' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to assign badge' });
        } finally {
            setAssigning(false);
        }
    };

    const handleRemove = async (pilotAwardId: string) => {
        if (!confirm('Are you sure you want to remove this badge from the pilot?')) return;

        try {
            const res = await fetch(`/api/admin/badges?id=${pilotAwardId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Badge removed successfully!' });
                fetchData();
            } else {
                setMessage({ type: 'error', text: 'Failed to remove badge' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to remove badge' });
        }
    };

    const filteredPilots = pilots.filter(p => 
        `${p.pilot_id} ${p.first_name} ${p.last_name}`.toLowerCase().includes(searchPilot.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Award className="w-8 h-8 text-accent-gold" />
                    Badge Management
                </h1>
                <p className="text-gray-400 mt-2">Assign and manage pilot badges/awards</p>
            </div>

            {/* Message */}
            {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {message.text}
                </div>
            )}

            {/* Assign Badge Form */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-accent-gold" />
                    Assign Badge to Pilot
                </h2>
                
                <div className="grid md:grid-cols-3 gap-4">
                    {/* Pilot Select */}
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Select Pilot</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search pilot..."
                                value={searchPilot}
                                onChange={(e) => setSearchPilot(e.target.value)}
                                className="w-full bg-dark-700 border border-white/10 rounded px-3 py-2 text-white text-sm mb-2"
                            />
                            <select
                                value={selectedPilot}
                                onChange={(e) => setSelectedPilot(e.target.value)}
                                className="w-full bg-dark-700 border border-white/10 rounded px-3 py-2 text-white"
                            >
                                <option value="">-- Select Pilot --</option>
                                {filteredPilots.map(p => (
                                    <option key={p._id} value={p._id}>
                                        {p.pilot_id} - {p.first_name} {p.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Award Select */}
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Select Badge</label>
                        <select
                            value={selectedAward}
                            onChange={(e) => setSelectedAward(e.target.value)}
                            className="w-full bg-dark-700 border border-white/10 rounded px-3 py-2 text-white mt-8"
                        >
                            <option value="">-- Select Badge --</option>
                            {awards.map(a => (
                                <option key={a._id} value={a._id}>
                                    {a.name} {a.category ? `(${a.category})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Submit */}
                    <div className="flex items-end">
                        <button
                            onClick={handleAssign}
                            disabled={assigning}
                            className="w-full bg-accent-gold hover:bg-accent-gold/80 text-dark-900 font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
                        >
                            {assigning ? 'Assigning...' : 'Assign Badge'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Current Assignments */}
            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white">Current Badge Assignments</h2>
                    <p className="text-gray-500 text-sm">{pilotAwards.length} badges assigned</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-400 border-b border-white/5 bg-dark-800/50">
                                <th className="p-4">Pilot</th>
                                <th className="p-4">Badge</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Earned Date</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pilotAwards.map((pa: any) => (
                                <tr key={pa._id} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="p-4 text-white">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-500" />
                                            <span className="font-mono text-accent-gold">{pa.pilot_id?.pilot_id}</span>
                                            <span>{pa.pilot_id?.first_name} {pa.pilot_id?.last_name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {pa.award_id?.imageUrl ? (
                                                <img src={`/img/badge/${pa.award_id.imageUrl}`} alt="" className="w-8 h-8 object-contain" />
                                            ) : (
                                                <Award className="w-5 h-5 text-accent-gold" />
                                            )}
                                            <span className="text-white">{pa.award_id?.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-400">{pa.award_id?.category || '-'}</td>
                                    <td className="p-4 text-gray-400">
                                        {new Date(pa.earned_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleRemove(pa._id)}
                                            className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded transition-colors"
                                            title="Remove badge"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {pilotAwards.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        No badges have been assigned yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
