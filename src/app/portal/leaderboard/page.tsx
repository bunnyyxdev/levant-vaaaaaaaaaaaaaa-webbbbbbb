'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Users, Loader2, Award, Clock } from 'lucide-react';
import RankBadge from '@/components/RankBadge';

interface LeaderboardPilot {
    rank: number;
    pilotId: string;
    name: string;
    hours: number;
    flights: number;
    pilotRank: string;
}

const ranks = [
    { name: 'Cadet', hours: 0, flights: 0, image: '/img/ranks/cadet.png', color: 'text-gray-400' },
    { name: 'Second Officer', hours: 50, flights: 10, image: '/img/ranks/secondofficer.png', color: 'text-blue-400' },
    { name: 'First Officer', hours: 150, flights: 30, image: '/img/ranks/firstofficer.png', color: 'text-green-400' },
    { name: 'Senior First Officer', hours: 300, flights: 60, image: '/img/ranks/seniorcaptain.png', color: 'text-purple-400' },
    { name: 'Captain', hours: 500, flights: 100, image: '/img/ranks/captain.png', color: 'text-accent-gold' },
];

export default function LeaderboardPage() {
    const [activeTab, setActiveTab] = useState<'leaderboard' | 'ranks'>('leaderboard');
    const [leaderboard, setLeaderboard] = useState<LeaderboardPilot[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'leaderboard') {
            setLoading(true);
            fetch('/api/leaderboard')
                .then(res => res.json())
                .then(data => setLeaderboard(data.pilots || []))
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [activeTab]);

    return (
        <div className="space-y-6">
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Trophy className="w-8 h-8 text-accent-gold" />
                    <div>
                        <h1 className="text-2xl font-bold text-white">Pilot Rankings</h1>
                        <p className="text-gray-400">Top performers and career progression</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('leaderboard')}
                        className={`px-6 py-2 rounded-lg font-bold transition-all ${
                            activeTab === 'leaderboard' 
                                ? 'bg-accent-gold text-dark-900' 
                                : 'bg-dark-700 text-white hover:bg-white/10'
                        }`}
                    >
                        <Trophy className="w-4 h-4 inline mr-2" />
                        Leaderboard
                    </button>
                    <button
                        onClick={() => setActiveTab('ranks')}
                        className={`px-6 py-2 rounded-lg font-bold transition-all ${
                            activeTab === 'ranks' 
                                ? 'bg-accent-gold text-dark-900' 
                                : 'bg-dark-700 text-white hover:bg-white/10'
                        }`}
                    >
                        <Star className="w-4 h-4 inline mr-2" />
                        Rank Progression
                    </button>
                </div>
            </div>

            {activeTab === 'leaderboard' && (
                <div className="glass-card p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <Loader2 className="w-10 h-10 animate-spin text-accent-gold mb-4" />
                            <p>Fetching top pilots...</p>
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg">No pilots on the leaderboard yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {leaderboard.map((pilot, index) => (
                                <div 
                                    key={pilot.pilotId}
                                    className={`flex items-center gap-4 p-5 rounded-xl border transition-all ${
                                        index === 0 ? 'bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.1)]' :
                                        index === 1 ? 'bg-gray-400/10 border-gray-400/30' :
                                        index === 2 ? 'bg-orange-500/10 border-orange-500/30' :
                                        'bg-dark-700/50 border-white/5 hover:border-white/10'
                                    }`}
                                >
                                    <div className={`text-3xl font-bold w-12 text-center ${
                                        index === 0 ? 'text-yellow-400' :
                                        index === 1 ? 'text-gray-300' :
                                        index === 2 ? 'text-orange-400' :
                                        'text-gray-500'
                                    }`}>
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-dark-800 flex items-center justify-center border border-white/5">
                                        <Users className="w-6 h-6 text-gray-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-bold text-lg">{pilot.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-accent-gold font-mono text-xs font-bold uppercase tracking-widest">{pilot.pilotId}</span>
                                            <span className="text-gray-600 text-[10px]">•</span>
                                            <RankBadge rank={pilot.pilotRank} size="sm" showText />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-accent-gold font-bold text-xl">{pilot.hours.toFixed(1)}<span className="text-xs ml-1 opacity-50">HRS</span></p>
                                        <p className="text-gray-500 text-xs font-bold uppercase tracking-tighter">{pilot.flights} Flights</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'ranks' && (
                <div className="glass-card p-6">
                    <div className="grid gap-4">
                        {ranks.map((rank, index) => (
                            <div key={rank.name} className="flex items-center gap-6 p-6 bg-dark-700/50 rounded-xl border border-white/5 hover:border-accent-gold/20 transition-all group">
                                <div className="w-24 h-16 flex items-center justify-center relative">
                                    <img src={rank.image} alt={rank.name} className="h-12 w-auto object-contain group-hover:scale-110 transition-transform" />
                                    <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-dark-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                        {index + 1}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-bold text-xl mb-1 ${rank.color}`}>{rank.name}</h3>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-gray-500" />
                                            <span className="text-white text-sm font-semibold">{rank.hours}+ Hours</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Award className="w-3.5 h-3.5 text-gray-500" />
                                            <span className="text-white text-sm font-semibold">{rank.flights}+ Flights</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden md:block text-right">
                                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Level</p>
                                    <p className="text-white font-mono text-lg">{index + 1}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
