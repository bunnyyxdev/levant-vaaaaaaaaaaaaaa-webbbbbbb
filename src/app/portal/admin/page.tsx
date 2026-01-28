'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Users, 
    Plane, 
    FileText, 
    ShoppingBag, 
    Map, 
    Bell, 
    Settings,
    ArrowRight,
    Loader2,
    Check
} from 'lucide-react';

interface AdminStats {
    totalPilots: number;
    activeFlights: number;
    totalFlights: number;
    pendingPireps: number;
}

export default function AdminPage() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            const data = await res.json();
            if (res.ok) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const adminActions = [
        { 
            title: 'Manage Pilots', 
            description: 'Activate, suspend, or update pilot roles.',
            icon: <Users className="w-8 h-8 text-blue-400" />,
            link: '/portal/admin/pilots',
            count: stats?.totalPilots
        },
        { 
            title: 'Store Management', 
            description: 'Manage items, prices, and download links.',
            icon: <ShoppingBag className="w-8 h-8 text-accent-gold" />,
            link: '/portal/admin/store'
        },
        { 
            title: 'Tour Management', 
            description: 'Create multi-leg tours and rewards.',
            icon: <Map className="w-8 h-8 text-green-400" />,
            link: '/portal/admin/tours'
        },
        { 
            title: 'Audit PIREPs', 
            description: 'Review and approve pending flight reports.',
            icon: <FileText className="w-8 h-8 text-yellow-400" />,
            link: '/portal/admin/reports',
            count: stats?.pendingPireps,
            alert: (stats?.pendingPireps || 0) > 0
        },
    ];

    return (
        <div className="space-y-6">
            <div className="glass-card p-6">
                <h1 className="text-2xl font-bold text-white mb-2">Admin Control Center</h1>
                <p className="text-gray-400">Levant Virtual Airline operations and management</p>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-5 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Users className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Total Pilots</p>
                    <p className="text-3xl font-bold text-white mt-1">
                        {loading ? <Loader2 className="w-6 h-6 animate-spin text-accent-gold" /> : stats?.totalPilots.toLocaleString()}
                    </p>
                </div>
                <div className="glass-card p-5 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Plane className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Active Flights</p>
                    <p className="text-3xl font-bold text-accent-gold mt-1">
                        {loading ? <Loader2 className="w-6 h-6 animate-spin text-accent-gold" /> : stats?.activeFlights.toLocaleString()}
                    </p>
                </div>
                <div className="glass-card p-5 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <FileText className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Total PIREPs</p>
                    <p className="text-3xl font-bold text-white mt-1">
                        {loading ? <Loader2 className="w-6 h-6 animate-spin text-accent-gold" /> : stats?.totalFlights.toLocaleString()}
                    </p>
                </div>
                <div className="glass-card p-5 relative overflow-hidden group bg-yellow-500/5 border-yellow-500/10">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Clock className="w-12 h-12 text-yellow-400" />
                    </div>
                    <p className="text-yellow-500/60 text-xs uppercase tracking-widest font-bold">Pending Approval</p>
                    <p className="text-3xl font-bold text-yellow-400 mt-1">
                        {loading ? <Loader2 className="w-6 h-6 animate-spin text-accent-gold" /> : stats?.pendingPireps.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Main Actions Grid */}
            <div className="grid md:grid-cols-2 gap-4">
                {adminActions.map((action) => (
                    <Link key={action.title} href={action.link} className="glass-card p-6 hover:bg-white/5 transition-all group border border-white/5 hover:border-accent-gold/30">
                        <div className="flex items-start justify-between">
                            <div className="space-y-4 flex-1">
                                <div className="p-3 bg-white/5 rounded-xl w-fit group-hover:scale-110 transition-transform">
                                    {action.icon}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-white">{action.title}</h3>
                                        {action.count !== undefined && (
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${action.alert ? 'bg-yellow-500 text-dark-900' : 'bg-white/10 text-gray-400'}`}>
                                                {action.count}
                                            </span >
                                        )}
                                    </div>
                                    <p className="text-gray-400 text-sm mt-1">{action.description}</p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-accent-gold transition-colors" />
                        </div>
                    </Link>
                ))}
            </div>
            
            {/* Secondary Actions */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 <button className="glass-card p-4 flex flex-col items-center gap-2 text-gray-400 hover:text-white transition-colors opacity-50 cursor-not-allowed">
                     <Bell className="w-5 h-5" />
                     <span className="text-xs font-bold uppercase tracking-widest">Broadcast</span>
                 </button>
                 <button className="glass-card p-4 flex flex-col items-center gap-2 text-gray-400 hover:text-white transition-colors opacity-50 cursor-not-allowed">
                     <Settings className="w-5 h-5" />
                     <span className="text-xs font-bold uppercase tracking-widest">Settings</span>
                 </button>
                 <div className="glass-card p-4 flex flex-col items-center gap-2 text-accent-gold text-xs font-bold uppercase tracking-widest text-center">
                     <span className="opacity-50">System Status</span>
                     <span className="flex items-center gap-2 text-green-500"><Check className="w-3 h-3" /> Online</span>
                 </div>
            </div>
        </div>
    );
}

function Clock({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
    );
}

