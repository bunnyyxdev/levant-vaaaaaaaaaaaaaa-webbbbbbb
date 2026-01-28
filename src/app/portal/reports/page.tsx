'use client';

import { useState, useEffect } from 'react';

interface Report {
    _id: string;
    callsign: string;
    departure_icao: string;
    arrival_icao: string;
    aircraft_type: string;
    submitted_at: string;
    flight_time: number;
    landing_rate: number;
    status: string;
}

const statusStyles: Record<string, string> = {
    'Accepted': 'bg-green-500/20 text-green-400',
    'Pending': 'bg-yellow-500/20 text-yellow-400',
    'Rejected': 'bg-red-500/20 text-red-400',
};

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const sessionRes = await fetch('/api/auth/me');
            const session = await sessionRes.json();
            
            if (session.user?.id) {
                const res = await fetch(`/api/portal/reports/recent?pilotId=${session.user.id}&limit=50`);
                const data = await res.json();
                if (data.flights) {
                    setReports(data.flights);
                }
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (minutes: number) => {
        if (!minutes) return '-';
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hrs}:${String(mins).padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6">
            <div className="glass-card p-6">
                <h1 className="text-2xl font-bold text-white mb-2">My Flight Reports</h1>
                <p className="text-gray-400">View all your submitted flight reports</p>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-gray-500 text-sm border-b border-white/10 bg-dark-800/50">
                                <th className="p-4">Callsign</th>
                                <th className="p-4">Route</th>
                                <th className="p-4">Aircraft</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Duration</th>
                                <th className="p-4">Landing (fpm)</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-400">
                                        Loading reports...
                                    </td>
                                </tr>
                            ) : reports.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-400">
                                        No flight reports found.
                                    </td>
                                </tr>
                            ) : (
                                reports.map((report) => (
                                    <tr key={report._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-white font-mono">{report.callsign}</td>
                                        <td className="p-4 text-white">
                                            <span className="text-accent-gold">{report.departure_icao}</span>
                                            {' → '}
                                            <span className="text-accent-gold">{report.arrival_icao}</span>
                                        </td>
                                        <td className="p-4 text-gray-400">{report.aircraft_type}</td>
                                        <td className="p-4 text-gray-400">
                                            {report.submitted_at ? new Date(report.submitted_at).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="p-4 text-white">{formatDuration(report.flight_time)}</td>
                                        <td className={`p-4 font-mono ${
                                            report.landing_rate > -150 ? 'text-green-400' : 
                                            report.landing_rate > -200 ? 'text-yellow-400' : 'text-red-400'
                                        }`}>
                                            {report.landing_rate || '-'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs ${statusStyles[report.status] || 'bg-gray-500/20 text-gray-400'}`}>
                                                {report.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
