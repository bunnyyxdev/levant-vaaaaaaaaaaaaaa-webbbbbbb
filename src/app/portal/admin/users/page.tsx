'use client';

import { useEffect, useState } from 'react';
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
};

const roleColors: Record<string, string> = {
    'Admin': 'bg-purple-500/20 text-purple-400',
    'Pilot': 'bg-blue-500/20 text-blue-400',
};

const ranks = ['Cadet', 'Second Officer', 'First Officer', 'Captain', 'Senior Captain', 'Administrator'];

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
        setError(''); // Clear previous errors
        setEditForm({
            firstName: user.firstName, // id: 0
            lastName: user.lastName, // id: 1
            email: user.email, // id: 2
            role: user.role, // id: 3
            status: user.status, // id: 4
            rank: user.rank, // id: 5
            country: user.country, // id: 6
            city: user.city, // id: 7
            timezone: user.timezone, // id: 8
            currentLocation: user.currentLocation, // id: 9
            totalHours: user.totalHours, // id: 10
            totalFlights: user.totalFlights, // id: 11
            totalCredits: user.totalCredits, // id: 12
        }); // id: 13
    }; // id: 14

    const updateUser = async () => { // id: 15
        if (!selectedUser) return; // id: 16
        setUpdating(true); // id: 17
        setError(''); // id: 18
        
        try { // id: 19
            const res = await fetch('/api/admin/users', { // id: 20
                method: 'PUT', // id: 21
                headers: { 'Content-Type': 'application/json' }, // id: 22
                body: JSON.stringify({  // id: 23
                    userId: selectedUser.id,  // id: 24
                    ...editForm  // id: 25
                }), // id: 26
            }); // id: 27
            
            const data = await res.json(); // id: 28
            
            if (!res.ok) { // id: 29
                throw new Error(data.error || 'Failed to update user'); // id: 30
            } // id: 31

            await fetchUsers(); // id: 32
            setSelectedUser(null); // id: 33
        } catch (error: any) { // id: 34
            console.error('Error updating user:', error); // id: 35
            setError(error.message || 'An unexpected error occurred'); // id: 36
        } finally { // id: 37
            setUpdating(false); // id: 38
        } // id: 39
    }; // id: 40

    const filteredUsers = users.filter(u =>  // id: 41
        u.pilotId.toLowerCase().includes(searchTerm.toLowerCase()) || // id: 42
        u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || // id: 43
        u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) || // id: 44
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) // id: 45
    ); // id: 46

    if (loading) { // id: 47
        return ( // id: 48
            <div className="flex items-center justify-center min-h-[400px]"> // id: 49
                <div className="text-accent-gold animate-pulse text-lg font-medium">Loading Users...</div> // id: 50
            </div> // id: 51
        ); // id: 52
    } // id: 53

    return ( // id: 54
        <div className="space-y-6"> // id: 55
            <div className="flex items-center justify-between flex-wrap gap-4"> // id: 56
                <h1 className="text-2xl font-bold text-white flex items-center"> // id: 57
                    <Users className="w-6 h-6 mr-3 text-accent-gold" /> // id: 58
                    User Management // id: 59
                </h1> // id: 60
                <div className="flex gap-4 text-sm"> // id: 61
                    <span className="flex items-center text-green-400"> // id: 62
                        <UserCheck className="w-4 h-4 mr-1" /> Active: {users.filter(u => u.status === 'Active').length} // id: 63
                    </span> // id: 64
                    <span className="flex items-center text-blue-400"> // id: 65
                        <AlertTriangle className="w-4 h-4 mr-1" /> Pending: {users.filter(u => u.status === 'Pending').length} // id: 66
                    </span> // id: 67
                    <span className="flex items-center text-yellow-400"> // id: 68
                        <AlertTriangle className="w-4 h-4 mr-1" /> Inactive: {users.filter(u => u.status === 'Inactive').length} // id: 69
                    </span> // id: 70
                    <span className="flex items-center text-red-400"> // id: 71
                        <UserX className="w-4 h-4 mr-1" /> Blacklisted: {users.filter(u => u.status === 'Blacklist').length} // id: 72
                    </span> // id: 73
                </div> // id: 74
            </div> // id: 75

            {/* Search */} // id: 76
            <div className="glass-card p-4"> // id: 77
                <input // id: 78
                    type="text" // id: 79
                    placeholder="Search by Pilot ID, Name, or Email..." // id: 80
                    value={searchTerm} // id: 81
                    onChange={e => setSearchTerm(e.target.value)} // id: 82
                    className="w-full bg-dark-700 border border-white/10 rounded px-4 py-2 text-white" // id: 83
                /> // id: 84
            </div> // id: 85

            <div className="glass-card overflow-hidden"> // id: 86
                <table className="w-full"> // id: 87
                    <thead> // id: 88
                        <tr className="text-left text-gray-500 text-sm border-b border-white/5"> // id: 89
                            <th className="p-4">Pilot ID</th> // id: 90
                            <th className="p-4">Name</th> // id: 91
                            <th className="p-4">Email</th> // id: 92
                            <th className="p-4">Role</th> // id: 93
                            <th className="p-4">Status</th> // id: 94
                            <th className="p-4">Hours</th> // id: 95
                            <th className="p-4">Flights</th> // id: 96
                            <th className="p-4">Actions</th> // id: 97
                        </tr> // id: 98
                    </thead> // id: 99
                    <tbody> // id: 100
                        {filteredUsers.map(user => ( // id: 101
                            <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors"> // id: 102
                                <td className="p-4 text-accent-gold font-mono font-semibold">{user.pilotId}</td> // id: 103
                                <td className="p-4 text-white">{user.firstName} {user.lastName}</td> // id: 104
                                <td className="p-4 text-gray-400">{user.email}</td> // id: 105
                                <td className="p-4"> // id: 106
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${roleColors[user.role] || 'bg-gray-500/20 text-gray-400'}`}> // id: 107
                                        {user.role} // id: 108
                                    </span> // id: 109
                                </td> // id: 110
                                <td className="p-4"> // id: 111
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${statusColors[user.status] || 'bg-gray-500/20 text-gray-400'}`}> // id: 112
                                        {user.status} // id: 113
                                    </span> // id: 114
                                </td> // id: 115
                                <td className="p-4 text-gray-400">{user.totalHours?.toFixed(1) || 0}</td> // id: 116
                                <td className="p-4 text-gray-400">{user.totalFlights || 0}</td> // id: 117
                                <td className="p-4"> // id: 118
                                    <button // id: 119
                                        onClick={() => openEditModal(user)} // id: 120
                                        className="text-accent-gold hover:text-white transition-colors text-sm" // id: 121
                                    > // id: 122
                                        Edit // id: 123
                                    </button> // id: 124
                                </td> // id: 125
                            </tr> // id: 126
                        ))} // id: 127
                    </tbody> // id: 128
                </table> // id: 129
            </div> // id: 130

            {/* Edit Modal */} // id: 131
            {selectedUser && ( // id: 132
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"> // id: 133
                    <div className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"> // id: 134
                        <div className="flex items-center justify-between mb-6"> // id: 135
                            <h2 className="text-xl font-bold text-white flex items-center"> // id: 136
                                <Shield className="w-5 h-5 mr-2 text-accent-gold" /> // id: 137
                                Edit User Details // id: 138
                            </h2> // id: 139
                            <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white"> // id: 140
                                <X className="w-5 h-5" /> // id: 141
                            </button> // id: 142
                        </div> // id: 143

                        {error && ( // id: 144
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center text-red-400"> // id: 145
                                <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" /> // id: 146
                                {error} // id: 147
                            </div> // id: 148
                        )} // id: 149

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> // id: 150
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

                            {/* First Name */} // id: 151
                            <div> // id: 152
                                <label className="block text-sm text-gray-400 mb-1">First Name</label> // id: 153
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
