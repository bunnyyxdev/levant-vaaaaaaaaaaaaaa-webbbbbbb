'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Clock, CreditCard, Plane, Award } from 'lucide-react';
import RankBadge from '@/components/RankBadge';

// Dynamically import the entire Map component to avoid SSR/Leaflet issues
const DashboardMap = dynamic(
    () => import('@/components/DashboardMap'),
    { 
        loading: () => (
            <div className="h-full flex items-center justify-center bg-dark-700">
                <span className="text-gray-400">Loading map...</span>
            </div>
        ),
        ssr: false 
    }
);

// Add icon helper mapping
const getStatIcon = (label: string) => {
    switch (label) {
        case 'Your Location': return MapPin;
        case 'Total Hours': return Clock;
        case 'Total Credits': return CreditCard;
        case 'Landing Average': return Plane;
        default: return MapPin;
    }
};

const statusColors: Record<string, string> = {
    'Preflight': 'bg-blue-500/20 text-blue-400',
    'Taxi': 'bg-yellow-500/20 text-yellow-400',
    'Cruise': 'bg-green-500/20 text-green-400',
    'Descent': 'bg-orange-500/20 text-orange-400',
    'Landing': 'bg-purple-500/20 text-purple-400',
    'Taxi to Gate': 'bg-pink-500/20 text-pink-400',
    'Arrived': 'bg-gray-500/20 text-gray-400',
};

export default function DashboardPage() {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        stats: [] as any[],
        newestPilots: [] as any[],
        recentReports: [] as any[],
        activeFlights: [] as any[],
        dotm: null as any,
    });

    useEffect(() => {
        setMounted(true);
        // Start all fetches in parallel but don't wait for all to finish before rendering what we have
        fetchStats();
        fetchPilots();
        fetchReports();
        fetchFlights();
        fetchDotm();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/portal/stats');
            const data = await res.json();
            if (data.stats) {
                setDashboardData(prev => ({ ...prev, stats: data.stats }));
            }
        } catch (err) { console.error('Stats fetch error:', err); }
    };

    const fetchPilots = async () => {
        try {
            const res = await fetch('/api/portal/new-pilots');
            const data = await res.json();
            if (data.pilots) {
                setDashboardData(prev => ({ ...prev, newestPilots: data.pilots }));
            }
        } catch (err) { console.error('Pilots fetch error:', err); }
    };

    const fetchReports = async () => {
        try {
            const res = await fetch('/api/portal/reports/recent');
            const data = await res.json();
            if (data.reports) {
                setDashboardData(prev => ({ ...prev, recentReports: data.reports }));
            }
        } catch (err) { console.error('Reports fetch error:', err); }
    };

    const fetchFlights = async () => {
        try {
            const res = await fetch('/api/portal/active-flights');
            const data = await res.json();
            if (data.activeFlights) {
                setDashboardData(prev => ({ ...prev, activeFlights: data.activeFlights }));
            }
        } catch (err) { console.error('Active flights fetch error:', err); }
    };

    const fetchDotm = async () => {
        try {
            const res = await fetch('/api/dotm');
            const data = await res.json();
            if (data.dotm) {
                setDashboardData(prev => ({ ...prev, dotm: data.dotm }));
            }
        } catch (err) { console.error('DOTM fetch error:', err); }
        finally { setLoading(false); } // Turn off main loading indicator when at least one thing finishes (or keep it until critical data is loaded)
    };

    if (loading && !mounted) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-accent-gold animate-pulse text-lg font-medium">Loading Dashboard...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardData.stats.map((stat: any) => {
                    const Icon = getStatIcon(stat.label);
                    return (
                        <div key={stat.label} className="glass-card p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm">{stat.label}</p>
                                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                
                {/* DOTM Card (Only if active) */}
                {dashboardData.dotm && (
                    <div className="lg:col-span-3 glass-card relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Award className="w-32 h-32" />
                        </div>
                        <div className="p-6 relative z-10 flex flex-col md:flex-row items-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-accent-gold/20 border-2 border-accent-gold flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                                <span className="text-3xl font-bold text-accent-gold font-mono">{dashboardData.dotm.icao}</span>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                    <Award className="w-5 h-5 text-accent-gold" />
                                    <span className="text-accent-gold font-bold tracking-wider uppercase text-sm">Destination of the Month</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Fly to/from {dashboardData.dotm.icao}</h3>
                                <p className="text-gray-300 max-w-2xl">{dashboardData.dotm.description || 'Explore this featured destination and earn bonus points!'}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-1">Bonus Reward</p>
                                <p className="text-4xl font-bold text-green-400">+{dashboardData.dotm.bonus_points}</p>
                                <p className="text-xs text-gray-500 font-bold mt-1">POINTS</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Live Map */}
                <div className="lg:col-span-2 glass-card overflow-hidden">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-white">Live Map</h2>
                        <span className="text-xs text-gray-500 flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                            LIVE TRACKING
                        </span>
                    </div>
                    <div className="h-80 relative">
                        {mounted ? (
                            <DashboardMap />
                        ) : (
                            <div className="h-full flex items-center justify-center bg-dark-700">
                                <span className="text-gray-400">Loading map...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Newest Pilots */}
                <div className="glass-card">
                    <div className="p-4 border-b border-white/10">
                        <h2 className="text-lg font-semibold text-white">Newest Pilots</h2>
                    </div>
                    <div className="p-4 space-y-3">
                        {dashboardData.newestPilots.length > 0 ? (
                            dashboardData.newestPilots.map((pilot: any) => (
                                <div key={pilot.id} className="flex items-center justify-between py-2 group cursor-default">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-accent-gold to-accent-bronze rounded-full flex items-center justify-center text-dark-900 text-xs font-bold group-hover:scale-110 transition-transform">
                                            {pilot.name.split(' ').map((n: string) => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="text-white text-sm group-hover:text-accent-gold transition-colors">{pilot.name}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500 text-[10px] font-mono">{pilot.id}</span>
                                                <span className="text-gray-700 text-[8px]">•</span>
                                                <RankBadge rank={pilot.rank} size="sm" />
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-gray-500 text-xs">{pilot.joined}</span>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center">
                                <p className="text-gray-500 text-sm">No newest pilots found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Reports */}
            <div className="glass-card">
                <div className="p-4 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white">Recent Reports</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-gray-500 text-sm border-b border-white/5">
                                <th className="p-4">Report ID</th>
                                <th className="p-4">Route</th>
                                <th className="p-4">Aircraft</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dashboardData.recentReports.length > 0 ? (
                                dashboardData.recentReports.map((report: any) => (
                                    <tr key={report.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-white font-mono text-sm">{report.id}</td>
                                        <td className="p-4 text-white font-medium">{report.route}</td>
                                        <td className="p-4 text-gray-400">{report.aircraft}</td>
                                        <td className="p-4 text-gray-400">{report.date}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${report.status === 'Accepted' ? 'bg-green-500/20 text-green-400' :
                                                report.status === 'Rejected' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {report.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500 italic">No reports found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Active Flights */}
            <div className="glass-card">
                <div className="p-4 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white">Active Flights</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-gray-500 text-sm border-b border-white/5">
                                <th className="p-4">Callsign</th>
                                <th className="p-4">Pilot</th>
                                <th className="p-4">Departure</th>
                                <th className="p-4">Arrival</th>
                                <th className="p-4">Equipment</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dashboardData.activeFlights.length > 0 ? (
                                dashboardData.activeFlights.map((flight: any) => (
                                    <tr key={flight.callsign} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-accent-gold font-mono font-semibold">{flight.callsign}</td>
                                        <td className="p-4 text-white">{flight.pilot}</td>
                                        <td className="p-4 text-white font-mono">{flight.departure}</td>
                                        <td className="p-4 text-white font-mono">{flight.arrival}</td>
                                        <td className="p-4 text-gray-400">{flight.equipment}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusColors[flight.status] || 'bg-gray-500/20 text-gray-400'}`}>
                                                {flight.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500 italic">No active flights currently</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
