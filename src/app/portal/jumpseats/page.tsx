'use client';

import { useState, useEffect } from 'react';
import { Plane, MapPin, CreditCard, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const airports = [
    { icao: 'OLBA', name: 'Beirut', cost: 250 },
    { icao: 'OERK', name: 'Riyadh', cost: 500 },
    { icao: 'OMDB', name: 'Dubai', cost: 750 },
    { icao: 'HECA', name: 'Cairo', cost: 600 },
    { icao: 'OJAI', name: 'Amman', cost: 300 },
    { icao: 'OSDI', name: 'Damascus', cost: 200 },
    { icao: 'LTFM', name: 'Istanbul', cost: 800 },
    { icao: 'OBBI', name: 'Bahrain', cost: 400 },
];

export default function JumpseatsPage() {
    const [selectedAirport, setSelectedAirport] = useState('');
    const [currentLocation, setCurrentLocation] = useState('...');
    const [credits, setCredits] = useState(0);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const fetchPilotData = async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (data.user) {
                // Fetch full pilot profile for latest credits and location
                const pilotRes = await fetch(`/api/pilots?pilotId=${data.user.pilotId}`);
                const pilotData = await pilotRes.json();
                if (pilotData.pilot) {
                    setCurrentLocation(pilotData.pilot.current_location || 'OLBA');
                    setCredits(pilotData.pilot.total_credits || 0);
                }
            }
        } catch (error) {
            console.error('Failed to fetch pilot data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPilotData();
    }, []);

    const handleJumpseat = async () => {
        if (!selectedAirport) return;
        
        const airport = airports.find(a => a.icao === selectedAirport);
        if (!airport) return;

        if (credits < airport.cost) {
            setStatus({ type: 'error', message: 'Insufficient credits for this jumpseat.' });
            return;
        }

        setBooking(true);
        setStatus(null);

        try {
            const res = await fetch('/api/portal/jumpseat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ destinationIcao: selectedAirport }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus({ type: 'success', message: data.message });
                setCurrentLocation(data.newLocation);
                setCredits(data.remainingCredits);
                setSelectedAirport('');
            } else {
                setStatus({ type: 'error', message: data.error || 'Failed to book jumpseat.' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Connection error. Please try again.' });
        } finally {
            setBooking(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="glass-card p-6">
                <div className="flex items-center gap-3">
                    <Plane className="w-8 h-8 text-accent-gold" />
                    <div>
                        <h1 className="text-2xl font-bold text-white">Jumpseats</h1>
                        <p className="text-gray-400">Instantly travel to another hub using your earned points</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="glass-card p-12 text-center text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-accent-gold" />
                    Loading your status...
                </div>
            ) : (
                <>
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Current Status */}
                        <div className="glass-card p-6">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-accent-gold" />
                                Current Status
                            </h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-dark-700/50 rounded-lg border border-white/5">
                                    <span className="text-gray-400">Current Location</span>
                                    <span className="text-accent-gold font-mono text-2xl font-bold">{currentLocation}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-dark-700/50 rounded-lg border border-white/5">
                                    <span className="text-gray-400">Available Points</span>
                                    <div className="text-right">
                                        <span className="text-green-400 font-bold text-2xl">{credits.toLocaleString()}</span>
                                        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Credits</p>
                                    </div>
                                </div>
                            </div>

                            {status && (
                                <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 border ${
                                    status.type === 'success' 
                                        ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                                }`}>
                                    {status.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                                    <p className="text-sm">{status.message}</p>
                                </div>
                            )}
                        </div>

                        {/* Jumpseat Selection */}
                        <div className="glass-card p-6">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-accent-gold" />
                                Select Destination
                            </h2>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {airports.map((airport) => {
                                    const isCurrent = airport.icao === currentLocation;
                                    const canAfford = credits >= airport.cost;

                                    return (
                                        <label
                                            key={airport.icao}
                                            className={`flex items-center justify-between p-4 rounded-lg transition-all group ${
                                                isCurrent 
                                                    ? 'bg-dark-800 opacity-50 cursor-not-allowed border border-white/5' 
                                                    : selectedAirport === airport.icao
                                                        ? 'bg-accent-gold/20 border border-accent-gold'
                                                        : 'bg-dark-700/50 border border-transparent hover:border-white/10 cursor-pointer'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <input
                                                    type="radio"
                                                    name="airport"
                                                    value={airport.icao}
                                                    disabled={isCurrent}
                                                    checked={selectedAirport === airport.icao}
                                                    onChange={(e) => setSelectedAirport(e.target.value)}
                                                    className="sr-only"
                                                />
                                                <div>
                                                    <p className={`font-mono text-lg font-bold ${selectedAirport === airport.icao ? 'text-accent-gold' : 'text-white'}`}>
                                                        {airport.icao}
                                                    </p>
                                                    <p className="text-gray-500 text-xs">{airport.name}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-bold ${!canAfford && !isCurrent ? 'text-red-400' : 'text-accent-gold'}`}>
                                                    {airport.cost.toLocaleString()}
                                                </p>
                                                <p className="text-[10px] text-gray-500 uppercase">Points</p>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Confirm */}
                    <div className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <p className="text-gray-400 text-sm">Review your selection before booking.</p>
                            {selectedAirport && (
                                <p className="text-white mt-1">
                                    Travel to <span className="text-accent-gold font-bold">{selectedAirport}</span> for <span className="text-accent-gold font-bold">{airports.find(a => a.icao === selectedAirport)?.cost} points</span>
                                </p>
                            )}
                        </div>
                        <button
                            onClick={handleJumpseat}
                            disabled={!selectedAirport || booking || credits < (airports.find(a => a.icao === selectedAirport)?.cost || 0)}
                            className="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-accent-gold to-yellow-600 text-dark-900 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-accent-gold/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {booking ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Confirm Jumpseat'
                            )}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
