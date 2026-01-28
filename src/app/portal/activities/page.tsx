'use client';
import { useState, useEffect } from 'react';
import ActivityCard from '@/components/ActivityCard';
import { Map, Calendar } from 'lucide-react';

export default function ActivitiesPage() {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'Event' | 'Tour'>('all');

    useEffect(() => {
        fetchActivities();
    }, [filter]);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const url = filter === 'all' 
                ? '/api/activities' 
                : `/api/activities?type=${filter}`;
            const res = await fetch(url);
            const data = await res.json();
            setActivities(data);
        } catch (err) {
            console.error('Error fetching activities:', err);
        } finally {
            setLoading(false);
        }
    };

    // Separate into Tours and Events
    const tours = activities.filter(a => a.type === 'Tour');
    const events = activities.filter(a => a.type === 'Event');

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-white mb-4">Tours & Events</h1>
                <div className="divider mx-auto" />
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Explore our exciting tours and events. Join our community activities, 
                    participate in group flights, and experience the thrill of virtual aviation with fellow pilots.
                </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex justify-center gap-2 mb-8">
                <button 
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === 'all' 
                            ? 'bg-accent-gold text-dark-900' 
                            : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                    }`}
                >
                    All
                </button>
                <button 
                    onClick={() => setFilter('Tour')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        filter === 'Tour' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                    }`}
                >
                    <Map className="w-4 h-4" />
                    Tours
                </button>
                <button 
                    onClick={() => setFilter('Event')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        filter === 'Event' 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                    }`}
                >
                    <Calendar className="w-4 h-4" />
                    Events
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[300px]">
                    <div className="animate-spin w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full" />
                </div>
            ) : (
                <>
                    {/* Tours Section */}
                    {(filter === 'all' || filter === 'Tour') && (
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Map className="w-6 h-6 text-blue-400" />
                                Tours
                            </h2>
                            {tours.length > 0 ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {tours.map((activity) => (
                                        <ActivityCard key={activity._id} activity={activity} />
                                    ))}
                                </div>
                            ) : (
                                <div className="glass-card p-8 text-center text-gray-400">
                                    There are currently no tours.
                                </div>
                            )}
                        </section>
                    )}

                    {/* Events Section */}
                    {(filter === 'all' || filter === 'Event') && (
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Calendar className="w-6 h-6 text-purple-400" />
                                Events
                            </h2>
                            {events.length > 0 ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {events.map((activity) => (
                                        <ActivityCard key={activity._id} activity={activity} />
                                    ))}
                                </div>
                            ) : (
                                <div className="glass-card p-8 text-center text-gray-400">
                                    There are currently no events.
                                </div>
                            )}
                        </section>
                    )}
                </>
            )}
        </div>
    );
}
