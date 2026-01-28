'use client';

import { useState, useEffect } from 'react';
import { Bell, Calendar, Megaphone, AlertTriangle, Gift } from 'lucide-react';

interface Notam {
    _id: string;
    title: string;
    content: string;
    type: 'news' | 'notam' | 'event';
    priority: 'normal' | 'important' | 'urgent';
    author_name: string;
    event_date?: string;
    event_location?: string;
    bonus_credits?: number;
    created_at: string;
}

export default function NewsPage() {
    const [notams, setNotams] = useState<Notam[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'news' | 'notam' | 'event'>('all');

    useEffect(() => {
        fetch('/api/notams')
            .then(res => res.json())
            .then(data => setNotams(data.notams || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = filter === 'all' ? notams : notams.filter(n => n.type === filter);

    const getIcon = (type: string) => {
        switch (type) {
            case 'notam': return <AlertTriangle className="w-5 h-5" />;
            case 'event': return <Calendar className="w-5 h-5" />;
            default: return <Megaphone className="w-5 h-5" />;
        }
    };

    const getPriorityStyle = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'border-red-500/50 bg-red-500/10';
            case 'important': return 'border-yellow-500/50 bg-yellow-500/10';
            default: return 'border-white/10 bg-dark-800/50';
        }
    };

    return (
        <div className="space-y-6">
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Bell className="w-8 h-8 text-accent-gold" />
                    <h1 className="text-2xl font-bold text-white">News & NOTAMs</h1>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                    {['all', 'news', 'notam', 'event'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab as any)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                                filter === tab 
                                    ? 'bg-accent-gold text-dark-900' 
                                    : 'bg-dark-700 text-white hover:bg-white/10'
                            }`}
                        >
                            {tab === 'all' ? 'All' : tab === 'notam' ? 'NOTAMs' : tab}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="glass-card p-12 text-center text-gray-400">Loading...</div>
            ) : filtered.length === 0 ? (
                <div className="glass-card p-12 text-center text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No announcements yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((item) => (
                        <div 
                            key={item._id} 
                            className={`glass-card p-6 border-l-4 ${getPriorityStyle(item.priority)}`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-lg ${
                                    item.type === 'event' ? 'bg-purple-500/20 text-purple-400' :
                                    item.type === 'notam' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-blue-500/20 text-blue-400'
                                }`}>
                                    {getIcon(item.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs px-2 py-0.5 rounded uppercase font-medium ${
                                            item.type === 'event' ? 'bg-purple-500/30 text-purple-300' :
                                            item.type === 'notam' ? 'bg-yellow-500/30 text-yellow-300' :
                                            'bg-blue-500/30 text-blue-300'
                                        }`}>
                                            {item.type}
                                        </span>
                                        {item.priority !== 'normal' && (
                                            <span className={`text-xs px-2 py-0.5 rounded uppercase font-medium ${
                                                item.priority === 'urgent' ? 'bg-red-500/30 text-red-300' :
                                                'bg-yellow-500/30 text-yellow-300'
                                            }`}>
                                                {item.priority}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                                    <p className="text-gray-300 whitespace-pre-wrap">{item.content}</p>
                                    
                                    {item.type === 'event' && (
                                        <div className="mt-4 flex flex-wrap gap-4 text-sm">
                                            {item.event_date && (
                                                <div className="flex items-center gap-2 text-purple-400">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(item.event_date).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            )}
                                            {item.bonus_credits && (
                                                <div className="flex items-center gap-2 text-accent-gold">
                                                    <Gift className="w-4 h-4" />
                                                    +{item.bonus_credits} bonus credits
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                                        <span>By {item.author_name}</span>
                                        <span>•</span>
                                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
