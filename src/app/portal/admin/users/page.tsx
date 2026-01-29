'use client';

import { useEffect, useState, useMemo } from 'react';
import { Users, Shield, UserX, UserCheck, AlertTriangle, X } from 'lucide-react';

interface User {
    id: string;
    pilotId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
    totalHours: number;
    totalFlights: number;
    totalCredits: number;
    rank: string;
    country: string;
    city: string;
    timezone: string;
    currentLocation: string;
    createdAt: string;
    lastActivity: string | null;
}

const statusColors: Record<string, string> = {
    'Active': 'bg-green-500/20 text-green-400',
    'Inactive': 'bg-yellow-500/20 text-yellow-400',
    'Blacklist': 'bg-red-500/20 text-red-400',
    'Pending': 'bg-blue-500/20 text-blue-400',
    'On leave (LOA)': 'bg-gray-500/20 text-gray-300',
};

const roleColors: Record<string, string> = {
    'Admin': 'bg-purple-500/20 text-purple-400',
    'Pilot': 'bg-blue-500/20 text-blue-400',
};

const ranks = ['Cadet', 'Second Officer', 'First Officer', 'Captain', 'Senior Captain'];

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [editForm, setEditForm] = useState<Partial<User>>({});
    const [updating, setUpdating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.users) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setError('');
        setEditForm({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            status: user.status,
            rank: user.rank,
            country: user.country,
            city: user.city,
            timezone: user.timezone,
            currentLocation: user.currentLocation,
            totalHours: user.totalHours,
            totalFlights: user.totalFlights,
            totalCredits: user.totalCredits,
        });
    };

    const updateUser = async () => {
        if (!selectedUser) return;
        setUpdating(true);
        setError('');
        
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: selectedUser.id, 
                    ...editForm 
                }),
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || 'Failed to update user');
            }

            await fetchUsers();
            setSelectedUser(null);
        } catch (error: any) {
            console.error('Error updating user:', error);
            setError(error.message || 'An unexpected error occurred');
        } finally {
            setUpdating(false);
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(u => 
            u.pilotId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const stats = useMemo(() => {
        return {
            active: users.filter(u => u.status === 'Active').length,
            pending: users.filter(u => u.status === 'Pending').length,
            inactive: users.filter(u => u.status === 'Inactive').length,
            loa: users.filter(u => u.status === 'On leave (LOA)').length,
            blacklisted: users.filter(u => u.status === 'Blacklist').length,
        };
    }, [users]);

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-accent-gold animate-pulse text-lg font-medium flex items-center gap-2">
                    <Users className="animate-bounce" /> Loading Members...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-3">
                        <Users className="w-8 h-8 text-accent-gold" />
                        Member Management
                    </h1>
                    <p className="text-gray-400 mt-1 font-mono text-sm">Manage pilots, permissions, and account status.</p>
                </div>
                
                <div className="flex gap-2 bg-dark-800/50 p-1 rounded-xl border border-white/5 backdrop-blur-sm">
                    {['Active', 'Pending', 'Inactive'].map((stat) => (
                        <div key={stat} className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 flex flex-col items-center min-w-[80px]">
                            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{stat}</span>
                            <span className={`text-xl font-bold ${
                                stat === 'Active' ? 'text-green-400' : 
                                stat === 'Pending' ? 'text-blue-400' : 'text-yellow-400'
                            }`}>
                                {stat === 'Active' ? stats.active : stat === 'Pending' ? stats.pending : stats.inactive}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Search & Filters */}
            <div className="glass-card p-2 flex items-center gap-4 sticky top-4 z-20 backdrop-blur-xl bg-dark-900/80 border-white/10 shadow-2xl">
                <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Users size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search pilots by ID, Name, or Email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-dark-800 border-none rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-accent-gold/50 transition-all"
                    />
                </div>
                <div className="hidden md:flex gap-2">
                   {/* Future filters could go here */}
                </div>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredUsers.map(user => (
                    <div key={user.id} className="glass-card group relative overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(234,179,8,0.1)] hover:border-accent-gold/30">
                        {/* Rank Stripe */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent-gold to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-dark-700 to-dark-800 border border-white/10 flex items-center justify-center text-lg font-bold text-gray-300 shadow-inner">
                                        {getInitials(user.firstName, user.lastName)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-accent-gold transition-colors">{user.firstName} {user.lastName}</h3>
                                        <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                                            <span className="text-accent-gold">{user.pilotId}</span>
                                            <span>•</span>
                                            <span>{user.rank}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => openEditModal(user)}
                                    className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                    title="Edit User"
                                >
                                    <Shield size={16} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-dark-900/50 rounded-lg p-2 border border-white/5">
                                    <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">Status</div>
                                    <div className={`text-xs font-bold px-2 py-0.5 rounded inline-block ${statusColors[user.status] || 'bg-gray-700 text-gray-400'}`}>
                                        {user.status}
                                    </div>
                                </div>
                                <div className="bg-dark-900/50 rounded-lg p-2 border border-white/5">
                                    <div className="text-[10px] uppercase text-gray-500 font-bold mb-1">Role</div>
                                    <div className={`text-xs font-bold px-2 py-0.5 rounded inline-block ${roleColors[user.role] || 'bg-gray-700 text-gray-400'}`}>
                                        {user.role}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-xs text-gray-400 border-t border-white/5 pt-4">
                                <div>
                                    <span className="block font-bold text-white">{user.totalHours?.toFixed(1)}</span>
                                    <span className="text-[10px] uppercase">Hours</span>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-white">{user.totalFlights}</span>
                                    <span className="text-[10px] uppercase">Flights</span>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-emerald-400">${user.totalCredits?.toLocaleString()}</span>
                                    <span className="text-[10px] uppercase">Credits</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <div className="text-center py-20 text-gray-500 glass-card">
                    <UserX className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">No pilots found matching "{searchTerm}"</p>
                </div>
            )}
            {/* Edit Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center">
                                <Shield className="w-5 h-5 mr-2 text-accent-gold" />
                                Edit User Details
                            </h2>
                            <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white p-1">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center text-red-400">
                                <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {/* Pilot ID */}
                            <div className="md:col-span-2">
                                <label className="block text-sm text-gray-400 mb-1">Pilot ID</label>
                                <input
                                    type="text"
                                    value={editForm.pilotId || ''}
                                    onChange={e => setEditForm({ ...editForm, pilotId: e.target.value })}
                                    className="w-full bg-dark-700 border border-white/10 rounded px-3 py-2 text-white font-mono font-bold text-accent-gold"
                                />
                            </div>

                            {/* First Name */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">First Name</label>
                                <input
                                    type="text"
                                    value={editForm.firstName || ''}
                                    onChange={e => setEditForm({ ...editForm, firstName: e.target.value })}
                                    className="w-full bg-dark-700 border border-white/10 rounded px-3 py-2 text-white"
                                />
                            </div>

                            {/* Last Name */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    value={editForm.lastName || ''}
                                    onChange={e => setEditForm({ ...editForm, lastName: e.target.value })}
                                    className="w-full bg-dark-700 border border-white/10 rounded px-3 py-2 text-white"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editForm.email || ''}
                                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full bg-dark-700 border border-white/10 rounded px-3 py-2 text-white"
                                />
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Role</label>
                                <select
                                    value={editForm.role || ''}
                                    onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                    className="w-full bg-dark-700 border border-white/10 rounded px-3 py-2 text-white"
                                >
                                    <option value="Pilot">Pilot</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Status</label>
                                <select
                                    value={editForm.status || ''}
                                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                                    className="w-full bg-dark-700 border border-white/10 rounded px-3 py-2 text-white"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="On leave (LOA)">On leave (LOA)</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Blacklist">Blacklist</option>
                                </select>
                            </div>

                            {/* Rank */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Rank</label>
                                <select
                                    value={editForm.rank || ''}
                                    onChange={e => setEditForm({ ...editForm, rank: e.target.value })}
                                    className="w-full bg-dark-700 border border-white/10 rounded px-3 py-2 text-white"
                                >
                                    {ranks.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Country */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Country</label>
                                <input
                                    type="text"
                                    value={editForm.country || ''}
                                    onChange={e => setEditForm({ ...editForm, country: e.target.value })}
                                    className="w-full bg-dark-700 border border-white/10 rounded px-3 py-2 text-white"
                                />
                            </div>

                            {/* City */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">City</label>
                                <input
                                    type="text"
                                    value={editForm.city || ''}
                                    onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                                    className="w-full bg-dark-700 border border-white/10 rounded px-3 py-2 text-white"
                                />
                            </div>

                            {/* Timezone */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Timezone</label>
                                <input
                                    type="text"
                                    value={editForm.timezone || ''}
                                    onChange={e => setEditForm({ ...editForm, timezone: e.target.value })}
                                    className="w-full bg-dark-700 border border-white/10 rounded px-3 py-2 text-white"
                                />
                            </div>

                            {/* Current Location */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Current Location (ICAO)</label>
                                <input
                                    type="text"
                                    value={editForm.currentLocation || ''}
                                    onChange={e => setEditForm({ ...editForm, currentLocation: e.target.value.toUpperCase() })}
                                    className="w-full bg-dark-700 border border-white/10 rounded px-3 py-2 text-white font-mono"
                                    maxLength={4}
                                />
                            </div>

                            {/* Total Hours */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Total Hours</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={editForm.totalHours ?? 0}
                                    onChange={e => setEditForm({ ...editForm, totalHours: parseFloat(e.target.value) || 0 })}
                                    className="w-full bg-dark-700 border border-white/10 rounded px-3 py-2 text-white"
                                />
                            </div>

                            {/* Total Flights */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Total Flights</label>
                                <input
                                    type="number"
                                    value={editForm.totalFlights ?? 0}
                                    onChange={e => setEditForm({ ...editForm, totalFlights: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-dark-700 border border-white/10 rounded px-3 py-2 text-white"
                                />
                            </div>

                            {/* Total Credits */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Total Credits</label>
                                <input
                                    type="number"
                                    value={editForm.totalCredits ?? 0}
                                    onChange={e => setEditForm({ ...editForm, totalCredits: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-dark-700 border border-white/10 rounded px-3 py-2 text-white"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={updateUser}
                                disabled={updating}
                                className="px-6 py-2 bg-accent-gold text-dark-900 rounded-lg font-semibold hover:bg-accent-gold/80 transition-colors disabled:opacity-50"
                            >
                                {updating ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
