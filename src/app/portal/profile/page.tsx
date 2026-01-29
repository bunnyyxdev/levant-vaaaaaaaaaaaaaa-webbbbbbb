'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Award } from 'lucide-react';
import RankBadge from '@/components/RankBadge';

interface Pilot {
    pilot_id: string;
    first_name: string;
    last_name: string;
    email: string;
    rank: string;
    country: string;
    timezone: string;
    ivao_id?: string;
    vatsim_id?: string;
    simbrief_id?: string;
    avatar_url?: string;
    total_hours: number;
    transfer_hours: number;
    total_flights: number;
    total_credits: number;
    current_location: string;
    average_landing: number;
    status: string;
    created_at: string;
    email_opt_in: boolean;
}

interface Country {
    code: string;
    name: string;
    flag: string;
    timezones: string[];
}

interface PilotBadge {
    _id: string;
    award_id: {
        _id: string;
        name: string;
        description?: string;
        imageUrl?: string;
        category?: string;
    };
    earned_at: string;
}

// Custom Country Select with Flag Images
function CountrySelect({ countries, value, onChange, getFlagUrl }: {
    countries: Country[];
    value: string;
    onChange: (code: string) => void;
    getFlagUrl: (code: string) => string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    
    const selectedCountry = countries.find(c => c.code === value);
    const filteredCountries = countries.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-dark-700 border border-white/10 rounded px-3 py-2 text-white flex items-center gap-2 text-left"
            >
                {selectedCountry ? (
                    <>
                        <img src={getFlagUrl(selectedCountry.code)} alt="" className="w-6 h-4 object-cover rounded" />
                        <span>{selectedCountry.name}</span>
                    </>
                ) : (
                    <span className="text-gray-400">Select a country</span>
                )}
                <span className="ml-auto">▼</span>
            </button>
            
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-dark-800 border border-white/10 rounded shadow-xl max-h-64 overflow-hidden">
                    <div className="p-2 border-b border-white/10">
                        <input
                            type="text"
                            placeholder="Search country..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-dark-700 border border-white/10 rounded px-3 py-2 text-white text-sm"
                            autoFocus
                        />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {filteredCountries.map(c => (
                            <button
                                key={c.code}
                                type="button"
                                onClick={() => {
                                    onChange(c.code);
                                    setIsOpen(false);
                                    setSearch('');
                                }}
                                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-white/10 text-white text-sm text-left"
                            >
                                <img src={getFlagUrl(c.code)} alt="" className="w-6 h-4 object-cover rounded" />
                                <span>{c.name}</span>
                                <span className="text-gray-500 text-xs ml-auto">{c.code}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ProfilePage() {
    const [pilot, setPilot] = useState<Pilot | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<Partial<Pilot>>({});
    const [flightHistory, setFlightHistory] = useState<any[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [availableTimezones, setAvailableTimezones] = useState<string[]>([]);
    const [pilotBadges, setPilotBadges] = useState<PilotBadge[]>([]);
    const router = useRouter();

    // Fetch countries from REST Countries API
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flag,timezones');
                const data = await res.json();
                const formattedCountries = data
                    .map((c: any) => ({
                        code: c.cca2,
                        name: c.name.common,
                        flag: c.flag,
                        timezones: c.timezones || []
                    }))
                    .sort((a: Country, b: Country) => a.name.localeCompare(b.name));
                setCountries(formattedCountries);
                
                // Extract unique timezones
                const allTimezones = new Set<string>();
                formattedCountries.forEach((c: Country) => {
                    c.timezones.forEach(tz => allTimezones.add(tz));
                });
                setAvailableTimezones(Array.from(allTimezones).sort());
            } catch (error) {
                console.error('Failed to fetch countries:', error);
            }
        };
        fetchCountries();
    }, []);

    useEffect(() => {
        fetchPilotData();
    }, []);

    const fetchPilotData = async () => {
        try {
            // First get the current user's session
            const sessionRes = await fetch('/api/auth/me');
            const sessionData = await sessionRes.json();
            
            if (!sessionData.user?.pilotId) {
                console.error('No pilot ID in session');
                setLoading(false);
                return;
            }

            // Fetch pilot profile
            const res = await fetch(`/api/pilots?id=${sessionData.user.pilotId}`);
            const data = await res.json();
            if (data.pilot) {
                setPilot(data.pilot);
                setFormData(data.pilot);
            }

            // Fetch flight history
            const flightsRes = await fetch(`/api/portal/reports/recent?pilotId=${sessionData.user.id}`);
            const flightsData = await flightsRes.json();
            if (flightsData.flights) {
                setFlightHistory(flightsData.flights);
            }

            // Fetch pilot badges
            const badgesRes = await fetch('/api/awards/my');
            const badgesData = await badgesRes.json();
            if (Array.isArray(badgesData)) {
                setPilotBadges(badgesData);
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pilot) return;

        try {
            const res = await fetch('/api/pilots', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pilotId: pilot.pilot_id,
                    updates: formData
                })
            });

            if (res.ok) {
                setPilot({ ...pilot, ...formData } as Pilot);
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    // Flag image from CDN (or local: /img/flag/{code.toLowerCase()}.png)
    const getFlagUrl = (code: string) => `https://flagcdn.com/24x18/${code.toLowerCase()}.png`;
    const getCountryName = (code: string) => countries.find(c => c.code === code)?.name || code;

    if (loading) return <div className="p-8 text-center text-gray-400">Loading profile...</div>;
    if (!pilot) return <div className="p-8 text-center text-red-400">Pilot not found</div>;

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <div className="glass-card p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="text-9xl">✈️</span>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                    {/* Avatar */}
                    <div className="w-32 h-32 rounded-full border-4 border-accent-gold shadow-lg overflow-hidden bg-dark-800 flex items-center justify-center">
                        {pilot.avatar_url ? (
                            <img src={pilot.avatar_url} alt="Pilot Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl text-gray-600">{pilot.first_name[0]}{pilot.last_name[0]}</span>
                        )}
                    </div>

                    {/* Info */}
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {pilot.first_name} {pilot.last_name}
                        </h1>
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-gray-300 mb-4">
                            <span className="bg-dark-700 px-3 py-1 rounded-full border border-white/10">
                                Joined: {new Date(pilot.created_at).toLocaleDateString()}
                            </span>
                            <span className="bg-accent-gold/20 text-accent-gold px-3 py-1 rounded-full border border-accent-gold/30">
                                {pilot.pilot_id}
                            </span>
                            <span className={`px-3 py-1 rounded-full border ${pilot.status === 'Active'
                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                                }`}>
                                {pilot.status === 'Active' ? '✓ Active' : '✗ Inactive'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                            <div className="bg-dark-700/50 p-3 rounded-lg">
                                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Rank</p>
                                <RankBadge rank={pilot.rank} size="md" />
                            </div>
                            <div className="bg-dark-700/50 p-3 rounded-lg">
                                <p className="text-gray-500 text-xs uppercase tracking-wider">Location</p>
                                <p className="text-accent-gold font-mono font-semibold">{pilot.current_location}</p>
                            </div>
                            <div className="bg-dark-700/50 p-3 rounded-lg">
                                <p className="text-gray-500 text-xs uppercase tracking-wider">Credits</p>
                                <p className="text-green-400 font-mono font-semibold">${pilot.total_credits.toLocaleString()}</p>
                            </div>
                            <div className="bg-dark-700/50 p-3 rounded-lg">
                                <p className="text-gray-500 text-xs uppercase tracking-wider">ACARS Hrs</p>
                                <p className="text-white font-mono font-semibold">{pilot.total_hours.toFixed(1)}h</p>
                            </div>
                            <div className="bg-dark-700/50 p-3 rounded-lg">
                                <p className="text-gray-500 text-xs uppercase tracking-wider">Transfer</p>
                                <p className="text-gray-300 font-mono font-semibold">{(pilot.transfer_hours || 0).toFixed(1)}h</p>
                            </div>
                        </div>

                        {/* Badges Section */}
                        {pilotBadges.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Award className="w-5 h-5 text-accent-gold" />
                                    <h3 className="text-sm font-semibold text-white">Earned Badges</h3>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {pilotBadges.map((badge) => (
                                        <div 
                                            key={badge._id} 
                                            className="group relative"
                                            title={`${badge.award_id?.name} - Earned ${new Date(badge.earned_at).toLocaleDateString()}`}
                                        >
                                            {badge.award_id?.imageUrl ? (
                                                <img 
                                                    src={`/img/badge/${badge.award_id.imageUrl}`}
                                                    alt={badge.award_id?.name || 'Badge'}
                                                    className="w-12 h-12 object-contain rounded-lg bg-dark-700/50 p-1 border border-white/10 group-hover:border-accent-gold transition-colors"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-dark-700/50 rounded-lg flex items-center justify-center border border-white/10 group-hover:border-accent-gold transition-colors">
                                                    <Award className="w-6 h-6 text-accent-gold" />
                                                </div>
                                            )}
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-dark-900 border border-white/10 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                {badge.award_id?.name || 'Badge'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column: Details & Edit */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Pilot Details */}
                    <div className="glass-card p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-white">Pilot Details</h2>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="text-accent-gold hover:text-white text-sm"
                            >
                                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                            </button>
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div className="relative">
                                    <label className="block text-gray-500 text-xs mb-1">Country</label>
                                    <CountrySelect 
                                        countries={countries}
                                        value={formData.country || ''}
                                        onChange={(code) => setFormData({ ...formData, country: code })}
                                        getFlagUrl={getFlagUrl}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-500 text-xs mb-1">Timezone</label>
                                    <select
                                        className="w-full bg-dark-700 border border-white/10 rounded px-3 py-2 text-white"
                                        value={formData.timezone || ''}
                                        onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                                    >
                                        {availableTimezones.map((tz: string) => (
                                            <option key={tz} value={tz}>{tz}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-500 text-xs mb-1">Avatar URL</label>
                                    <input
                                        type="text"
                                        className="w-full bg-dark-700 border border-white/10 rounded px-3 py-2 text-white"
                                        placeholder="https://..."
                                        value={formData.avatar_url || ''}
                                        onChange={e => setFormData({ ...formData, avatar_url: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-gray-500 text-xs mb-1">VATSIM ID</label>
                                        <input
                                            type="text"
                                            className="w-full bg-dark-700 border border-white/10 rounded px-3 py-2 text-white"
                                            value={formData.vatsim_id || ''}
                                            onChange={e => setFormData({ ...formData, vatsim_id: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 text-xs mb-1">IVAO ID</label>
                                        <input
                                            type="text"
                                            className="w-full bg-dark-700 border border-white/10 rounded px-3 py-2 text-white"
                                            value={formData.ivao_id || ''}
                                            onChange={e => setFormData({ ...formData, ivao_id: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-500 text-xs mb-1">Simbrief ID</label>
                                    <input
                                        type="text"
                                        className="w-full bg-dark-700 border border-white/10 rounded px-3 py-2 text-white"
                                        value={formData.simbrief_id || ''}
                                        onChange={e => setFormData({ ...formData, simbrief_id: e.target.value })}
                                    />
                                </div>

                                <div className="flex items-center space-x-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="emailOptIn"
                                        className="accent-accent-gold"
                                        checked={formData.email_opt_in || false}
                                        onChange={e => setFormData({ ...formData, email_opt_in: e.target.checked })}
                                    />
                                    <label htmlFor="emailOptIn" className="text-gray-400 text-xs">
                                        Receive non-administrative emails
                                    </label>
                                </div>

                                <button type="submit" className="w-full btn-primary py-2 text-sm mt-4">
                                    Update Profile
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-gray-500">Origin</span>
                                    <span className="text-white flex items-center gap-2">
                                        <img src={getFlagUrl(pilot.country)} alt={pilot.country} className="w-6 h-4 object-cover rounded" />
                                        {getCountryName(pilot.country)}
                                    </span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-gray-500">VATSIM CID</span>
                                    {pilot.vatsim_id ? (
                                        <a href={`https://stats.vatsim.net/search_id.php?id=${pilot.vatsim_id}`} target="_blank" className="text-green-400 hover:underline">
                                            {pilot.vatsim_id}
                                        </a>
                                    ) : <span className="text-gray-600">Not Provided</span>}
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-gray-500">IVAO VID</span>
                                    {pilot.ivao_id ? (
                                        <a href={`https://www.ivao.aero/Member.aspx?Id=${pilot.ivao_id}`} target="_blank" className="text-blue-400 hover:underline">
                                            {pilot.ivao_id}
                                        </a>
                                    ) : <span className="text-gray-600">Not Provided</span>}
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-gray-500">Simbrief ID</span>
                                    <span className="text-white">{pilot.simbrief_id || 'Not Provided'}</span>
                                </div>
                                <div className="flex justify-between pt-2">
                                    <span className="text-gray-500">Landing Avg</span>
                                    <span className={`${pilot.average_landing > -200 ? 'text-green-400' : 'text-yellow-400'} font-mono`}>
                                        {pilot.average_landing} fpm
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Badges & Awards Widget */}
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Award className="w-5 h-5 text-accent-gold" />
                            <h2 className="text-lg font-semibold text-white">Badges & Awards</h2>
                        </div>
                        
                        {pilotBadges.length > 0 ? (
                            <div className="grid grid-cols-3 gap-3">
                                {pilotBadges.map((badge) => (
                                    <div 
                                        key={badge._id} 
                                        className="group relative bg-dark-700/50 rounded-lg p-3 flex flex-col items-center border border-white/5 hover:border-accent-gold/50 transition-colors"
                                    >
                                        {badge.award_id?.imageUrl ? (
                                            <img 
                                                src={`/img/badge/${badge.award_id.imageUrl}`}
                                                alt={badge.award_id?.name || 'Badge'}
                                                className="w-16 h-16 object-contain mb-2"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-dark-600 rounded-full flex items-center justify-center mb-2">
                                                <Award className="w-8 h-8 text-accent-gold" />
                                            </div>
                                        )}
                                        <span className="text-xs text-gray-300 text-center font-medium truncate w-full">
                                            {badge.award_id?.name || 'Badge'}
                                        </span>
                                        <span className="text-[10px] text-gray-500">
                                            {new Date(badge.earned_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <Award className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm">No badges earned yet</p>
                                <p className="text-gray-600 text-xs mt-1">Complete tours and events to earn badges!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Flight History */}
                <div className="lg:col-span-2">
                    <div className="glass-card overflow-hidden">
                        <div className="p-6 border-b border-white/10">
                            <h2 className="text-lg font-semibold text-white">Recent Flights</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-gray-500 text-xs border-b border-white/5 bg-dark-800/50">
                                        <th className="p-4">Route</th>
                                        <th className="p-4">Aircraft</th>
                                        <th className="p-4">Time</th>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {flightHistory.map((flight, i) => (
                                        <tr key={flight._id || i} className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm">
                                            <td className="p-4 font-mono text-white">
                                                <span className="text-accent-gold">{flight.departure_icao}</span> → <span className="text-accent-gold">{flight.arrival_icao}</span>
                                            </td>
                                            <td className="p-4 text-gray-300">{flight.aircraft_type}</td>
                                            <td className="p-4 text-white">{flight.flight_time ? `${Math.floor(flight.flight_time / 60)}:${String(flight.flight_time % 60).padStart(2, '0')}` : '-'}</td>
                                            <td className="p-4 text-gray-500">{flight.submitted_at ? new Date(flight.submitted_at).toLocaleDateString() : '-'}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs ${flight.status === 'Accepted' ? 'bg-green-500/20 text-green-400' :
                                                        flight.status === 'Rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                    {flight.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {flightHistory.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-gray-500">
                                                No flights recorded yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
