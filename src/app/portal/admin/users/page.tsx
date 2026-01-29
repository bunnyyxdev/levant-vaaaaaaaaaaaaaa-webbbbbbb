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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-accent-gold animate-pulse text-lg font-medium">Loading Users...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h1 className="text-2xl font-bold text-white flex items-center">
                    <Users className="w-6 h-6 mr-3 text-accent-gold" />
                    User Management
                </h1>
                <div className="flex gap-4 text-sm flex-wrap">
                    <span className="flex items-center text-green-400">
                        <UserCheck className="w-4 h-4 mr-1" /> Active: {stats.active}
                    </span>
                    <span className="flex items-center text-blue-400">
                        <AlertTriangle className="w-4 h-4 mr-1" /> Pending: {stats.pending}
                    </span>
                    <span className="flex items-center text-yellow-400">
                        <AlertTriangle className="w-4 h-4 mr-1" /> Inactive: {stats.inactive}
                    </span>
                    <span className="flex items-center text-gray-400">
                        <AlertTriangle className="w-4 h-4 mr-1" /> LOA: {stats.loa}
                    </span>
                    <span className="flex items-center text-red-400">
                        <UserX className="w-4 h-4 mr-1" /> Blacklisted: {stats.blacklisted}
                    </span>
                </div>
            </div>

            {/* Search */}
            <div className="glass-card p-4">
                <input
                    type="text"
                    placeholder="Search by Pilot ID, Name, or Email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-dark-700 border border-white/10 rounded px-4 py-2 text-white outline-none focus:border-accent-gold"
                />
            </div>

            <div className="glass-card overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-gray-500 text-sm border-b border-white/5 whitespace-nowrap">
                            <th className="p-4">Pilot ID</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Hours</th>
                            <th className="p-4">Flights</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors whitespace-nowrap">
                                <td className="p-4 text-accent-gold font-mono font-semibold">{user.pilotId}</td>
                                <td className="p-4 text-white">{user.firstName} {user.lastName}</td>
                                <td className="p-4 text-gray-400">{user.email}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${roleColors[user.role] || 'bg-gray-500/20 text-gray-400'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${statusColors[user.status] || 'bg-gray-500/20 text-gray-400'}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-400">{user.totalHours?.toFixed(1) || 0}</td>
                                <td className="p-4 text-gray-400">{user.totalFlights || 0}</td>
                                <td className="p-4">
                                    <button
                                        onClick={() => openEditModal(user)}
                                        className="text-accent-gold hover:text-white transition-colors text-sm font-bold uppercase"
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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
