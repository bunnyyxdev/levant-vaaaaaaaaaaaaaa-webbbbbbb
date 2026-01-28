'use client';

import { useState, useEffect } from 'react';
import { Map, Plane, CheckCircle, Clock, Award, ChevronRight, Play } from 'lucide-react';

interface TourLeg {
    leg_number: number;
    departure_icao: string;
    arrival_icao: string;
    distance_nm?: number;
}

interface TourProgress {
    current_leg: number;
    legs_completed: { leg_number: number; completed_at: string }[];
    status: 'in_progress' | 'completed' | 'abandoned';
}

interface Tour {
    _id: string;
    name: string;
    description: string;
    legs: TourLeg[];
    total_distance: number;
    reward_credits: number;
    reward_badge?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    progress: TourProgress | null;
}

export default function ToursPage() {
    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
    const [starting, setStarting] = useState(false);

    const fetchTours = () => {
        setLoading(true);
        fetch('/api/tours')
            .then(res => res.json())
            .then(data => setTours(data.tours || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchTours(); }, []);

    const startTour = async (tourId: string) => {
        setStarting(true);
        try {
            const res = await fetch('/api/tours', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tourId }),
            });
            if (res.ok) {
                fetchTours();
            }
        } catch (error) {
            console.error('Start tour error:', error);
        } finally {
            setStarting(false);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'text-green-400 bg-green-500/20';
            case 'hard': return 'text-red-400 bg-red-500/20';
            default: return 'text-yellow-400 bg-yellow-500/20';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3">
                    <Map className="w-8 h-8 text-accent-gold" />
                    <div>
                        <h1 className="text-2xl font-bold text-white">Tours</h1>
                        <p className="text-gray-400">Complete multi-leg journeys to earn credits and badges</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="glass-card p-12 text-center text-gray-400">Loading tours...</div>
            ) : tours.length === 0 ? (
                <div className="glass-card p-12 text-center text-gray-400">
                    <Map className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No tours available yet</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {tours.map((tour) => (
                        <div key={tour._id} className="glass-card overflow-hidden">
                            {/* Tour Header */}
                            <div className="p-6 border-b border-white/10">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-xl font-bold text-white">{tour.name}</h3>
                                    <span className={`text-xs px-2 py-1 rounded uppercase font-medium ${getDifficultyColor(tour.difficulty)}`}>
                                        {tour.difficulty}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm">{tour.description}</p>
                                
                                {/* Stats */}
                                <div className="flex gap-4 mt-4 text-sm">
                                    <div className="flex items-center gap-1 text-gray-400">
                                        <Plane className="w-4 h-4" />
                                        {tour.legs.length} legs
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-400">
                                        <Clock className="w-4 h-4" />
                                        {tour.total_distance} nm
                                    </div>
                                    <div className="flex items-center gap-1 text-accent-gold">
                                        <Award className="w-4 h-4" />
                                        +{tour.reward_credits} credits
                                    </div>
                                </div>
                            </div>

                            {/* Progress / Legs */}
                            <div className="p-4 bg-dark-800/50">
                                <div className="space-y-2">
                                    {tour.legs.map((leg, index) => {
                                        const isCompleted = tour.progress?.legs_completed.some(l => l.leg_number === leg.leg_number);
                                        const isCurrent = tour.progress?.current_leg === leg.leg_number;
                                        
                                        return (
                                            <div 
                                                key={leg.leg_number}
                                                className={`flex items-center gap-3 p-2 rounded ${
                                                    isCompleted ? 'bg-green-500/20' :
                                                    isCurrent ? 'bg-accent-gold/20' :
                                                    'bg-dark-700/50'
                                                }`}
                                            >
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                    isCompleted ? 'bg-green-500 text-white' :
                                                    isCurrent ? 'bg-accent-gold text-dark-900' :
                                                    'bg-dark-600 text-gray-400'
                                                }`}>
                                                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : leg.leg_number}
                                                </div>
                                                <span className="font-mono text-white">{leg.departure_icao}</span>
                                                <ChevronRight className="w-4 h-4 text-gray-500" />
                                                <span className="font-mono text-white">{leg.arrival_icao}</span>
                                                {leg.distance_nm && (
                                                    <span className="text-gray-500 text-xs ml-auto">{leg.distance_nm} nm</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-4 border-t border-white/10">
                                {tour.progress?.status === 'completed' ? (
                                    <div className="bg-green-500/20 text-green-400 py-3 rounded-lg text-center font-semibold flex items-center justify-center gap-2">
                                        <CheckCircle className="w-5 h-5" />
                                        Tour Completed!
                                    </div>
                                ) : tour.progress ? (
                                    <div className="text-center text-gray-400">
                                        <p className="text-sm mb-2">
                                            Progress: {tour.progress.legs_completed.length} / {tour.legs.length} legs
                                        </p>
                                        <p className="text-xs">
                                            Fly from <span className="text-accent-gold font-mono">
                                                {tour.legs[tour.progress.current_leg - 1]?.departure_icao}
                                            </span> to <span className="text-accent-gold font-mono">
                                                {tour.legs[tour.progress.current_leg - 1]?.arrival_icao}
                                            </span> to continue
                                        </p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => startTour(tour._id)}
                                        disabled={starting}
                                        className="w-full bg-accent-gold text-dark-900 py-3 rounded-lg font-bold hover:bg-accent-gold/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <Play className="w-5 h-5" />
                                        Start Tour
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
