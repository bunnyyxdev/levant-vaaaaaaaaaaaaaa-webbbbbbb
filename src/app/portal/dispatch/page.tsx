'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plane, FileText, Send, ExternalLink, Users, Package, Navigation } from 'lucide-react';

interface Airport {
    icao: string;
    iata: string;
    name: string;
    country: string;
}

interface FlightPlan {
    id: string;
    origin: string;
    destination: string;
    originName: string;
    destName: string;
    aircraft: string;
    created: Date;
}

import { Suspense } from 'react';

function DispatchContent() {
    const searchParams = useSearchParams();
    
    const [departure, setDeparture] = useState('');
    const [arrival, setArrival] = useState('');
    const [alternate, setAlternate] = useState('');
    const [aircraftType, setAircraftType] = useState('');
    const [flightNumber, setFlightNumber] = useState('');
    const [weightUnit, setWeightUnit] = useState<'KGS' | 'LBS'>('KGS');
    
    // Derived callsign
    const callsign = `LVT${flightNumber}`;
    
    const [flightType, setFlightType] = useState<'passenger' | 'cargo'>('passenger');
    const [passengers, setPassengers] = useState('');
    const [cargo, setCargo] = useState('');
    const [airports, setAirports] = useState<Airport[]>([]);
    const [flightPlan, setFlightPlan] = useState<FlightPlan | null>(null);
    const [bidding, setBidding] = useState(false);
    const [bidSuccess, setBidSuccess] = useState(false);

    // Load airports from CSV
    useEffect(() => {
        fetch('/files/iata-icao.csv')
            .then(res => res.text())
            .then(text => {
                const lines = text.split('\n').slice(1);
                const parsed: Airport[] = [];
                lines.forEach(line => {
                    const parts = line.split(',');
                    if (parts.length >= 5 && parts[3]) {
                        parsed.push({
                            country: parts[0],
                            iata: parts[2],
                            icao: parts[3],
                            name: parts[4]?.replace(/\r/g, '') || ''
                        });
                    }
                });
                setAirports(parsed);
            })
            .catch(err => console.error('Failed to load airports:', err));
    }, []);

    // Fetch pilot data and active bid
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Fetch user session for callsign
                const authRes = await fetch('/api/auth/me');
                const authData = await authRes.json();
                if (authData.user) {
                    const pilotNum = authData.user.pilotId?.replace(/\D/g, '') || '';
                    setFlightNumber(pilotNum.padStart(4, '0')); // Ensure 4 digits logic or as is
                }

                // Pre-fill from URL params if present
                const depParam = searchParams.get('dep');
                const arrParam = searchParams.get('arr');
                const acParam = searchParams.get('aircraft');
                const fltNumParam = searchParams.get('flt'); // Just in case we pass it

                if (depParam) setDeparture(depParam.toUpperCase());
                if (arrParam) setArrival(arrParam.toUpperCase());
                if (acParam) setAircraftType(acParam.toUpperCase());
                if (fltNumParam) setFlightNumber(fltNumParam);

                // Fetch active bid (overwrite params if bid exists)
                const bidRes = await fetch('/api/dispatch/bid');
                const bidData = await bidRes.json();
                if (bidData.bid) {
                    setFlightPlan({
                        id: bidData.bid.id,
                        origin: bidData.bid.departure,
                        destination: bidData.bid.arrival,
                        originName: '', 
                        destName: '',   
                        aircraft: bidData.bid.aircraft,
                        created: new Date(bidData.bid.createdAt),
                    });
                    setDeparture(bidData.bid.departure);
                    setArrival(bidData.bid.arrival);
                    setAircraftType(bidData.bid.aircraft);
                    setBidSuccess(true);
                }
            } catch (error) {
                console.error('Failed to load initial dispatch data:', error);
            }
        };

        loadInitialData();
    }, [searchParams]);

    // Airport lookup helper
    const getAirportInfo = (icao: string): Airport | undefined => {
        if (!icao || icao.length < 3) return undefined;
        return airports.find(a => a.icao.toLowerCase() === icao.toLowerCase());
    };

    const depAirport = useMemo(() => getAirportInfo(departure), [departure, airports]);
    const arrAirport = useMemo(() => getAirportInfo(arrival), [arrival, airports]);
    const altAirport = useMemo(() => getAirportInfo(alternate), [alternate, airports]);

    const generateSimBrief = () => {
        if (!departure || !arrival || !aircraftType) {
            alert('Please fill in departure, arrival, and aircraft type');
            return;
        }

        // Use the specific link format requested by user, appending other details
        let url = `https://www.simbrief.com/system/dispatch.php?orig=${departure.toUpperCase()}&dest=${arrival.toUpperCase()}`;
        
        // Append other important details for a complete dispatch
        if (aircraftType) url += `&type=${aircraftType.toUpperCase()}`;
        if (alternate) url += `&altn=${alternate.toUpperCase()}`;
        if (callsign) url += `&fltnum=${callsign}`;
        if (flightType === 'passenger' && passengers) url += `&pax=${passengers}`;
        if (cargo) url += `&cargo=${cargo}`;
        url += `&units=${weightUnit}`;

        window.open(url, 'SimBrief', 'width=1200,height=800');

        setFlightPlan({
            id: `FP-${Date.now()}`,
            origin: departure.toUpperCase(),
            destination: arrival.toUpperCase(),
            originName: depAirport?.name || '',
            destName: arrAirport?.name || '',
            aircraft: aircraftType.toUpperCase(),
            created: new Date(),
        });
    };

    const bidFlight = async () => {
        if (!flightPlan) return;
        
        setBidding(true);
        try {
            const res = await fetch('/api/dispatch/bid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    departure: flightPlan.origin,
                    arrival: flightPlan.destination,
                    aircraft: flightPlan.aircraft,
                    callsign: callsign,
                }),
            });

            if (res.ok) {
                setBidSuccess(true);
            }
        } catch (error) {
            console.error('Error bidding flight:', error);
        } finally {
            setBidding(false);
        }
    };

    const resetForm = () => {
        setDeparture('');
        setArrival('');
        setAlternate('');
        setAircraftType('');
        setPassengers('');
        setCargo('');
        setFlightPlan(null);
        setBidSuccess(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3">
                    <Plane className="w-8 h-8 text-accent-gold" />
                    <div>
                        <h1 className="text-2xl font-bold text-white">Flight Dispatch</h1>
                        <p className="text-gray-400">Create a flight plan with SimBrief and bid for ACARS tracking</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Flight Planning Form */}
                <div className="glass-card p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-accent-gold" />
                        Flight Details
                    </h2>

                    {/* Route */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Departure (ICAO)</label>
                            <input
                                type="text"
                                value={departure}
                                onChange={(e) => setDeparture(e.target.value.toUpperCase())}
                                maxLength={4}
                                className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-lg uppercase focus:outline-none focus:border-accent-gold"
                            />
                            {depAirport && (
                                <div className="mt-2 p-2 bg-dark-700/50 rounded text-sm">
                                    <p className="text-white">{depAirport.name}</p>
                                    <p className="text-gray-500">{depAirport.country}</p>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Arrival (ICAO)</label>
                            <input
                                type="text"
                                value={arrival}
                                onChange={(e) => setArrival(e.target.value.toUpperCase())}
                                maxLength={4}
                                className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-lg uppercase focus:outline-none focus:border-accent-gold"
                            />
                            {arrAirport && (
                                <div className="mt-2 p-2 bg-dark-700/50 rounded text-sm">
                                    <p className="text-white">{arrAirport.name}</p>
                                    <p className="text-gray-500">{arrAirport.country}</p>
                                </div>
                            )}
                        </div>
                    </div>

                            {/* Alternate */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Alternate</label>
                            <input
                                type="text"
                                value={alternate}
                                onChange={(e) => setAlternate(e.target.value.toUpperCase())}
                                maxLength={4}
                                className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-3 text-white font-mono uppercase focus:outline-none focus:border-accent-gold"
                            />
                            {altAirport && (
                                <div className="mt-2 p-2 bg-dark-700/50 rounded text-sm">
                                    <p className="text-white">{altAirport.name}</p>
                                </div>
                            )}
                        </div>
                        
                        {/* Callsign Split */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Callsign</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value="LVT"
                                    readOnly
                                    className="w-20 bg-dark-800 border border-white/10 rounded-lg px-3 py-3 text-white font-mono uppercase text-center font-bold opacity-70 cursor-not-allowed"
                                />
                                <input
                                    type="text"
                                    value={flightNumber}
                                    readOnly
                                    className="flex-1 bg-dark-800 border border-white/10 rounded-lg px-4 py-3 text-white font-mono uppercase cursor-not-allowed opacity-70"
                                />
                            </div>
                        </div>


                    {/* Aircraft Type */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Aircraft Type (ICAO)</label>
                        <input
                            type="text"
                            value={aircraftType}
                            onChange={(e) => setAircraftType(e.target.value.toUpperCase())}
                            maxLength={4}
                            className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-lg uppercase focus:outline-none focus:border-accent-gold"
                        />
                    </div>

                    {/* Flight Type Toggle */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Flight Type</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setFlightType('passenger')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                                    flightType === 'passenger'
                                        ? 'bg-accent-gold text-dark-900'
                                        : 'bg-dark-700 text-white hover:bg-white/10 border border-white/10'
                                }`}
                            >
                                <Users className="w-5 h-5" />
                                Passenger
                            </button>
                            <button
                                type="button"
                                onClick={() => setFlightType('cargo')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                                    flightType === 'cargo'
                                        ? 'bg-accent-gold text-dark-900'
                                        : 'bg-dark-700 text-white hover:bg-white/10 border border-white/10'
                                }`}
                            >
                                <Package className="w-5 h-5" />
                                Cargo
                            </button>
                        </div>
                    </div>

                    {/* Passengers / Cargo */}
                    <div className="grid grid-cols-2 gap-4">
                        {flightType === 'passenger' && (
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Passengers</label>
                                <input
                                    type="number"
                                    value={passengers}
                                    onChange={(e) => setPassengers(e.target.value)}
                                    className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-gold"
                                />
                            </div>
                        )}
                        <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                                <label className="block text-sm text-gray-400 mb-2">Cargo</label>
                                <input
                                    type="number"
                                    value={cargo}
                                    onChange={(e) => setCargo(e.target.value)}
                                    className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-gold"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Unit</label>
                                <select
                                    value={weightUnit}
                                    onChange={(e) => setWeightUnit(e.target.value as 'KGS' | 'LBS')}
                                    className="w-full bg-dark-700 border border-white/10 rounded-lg px-2 py-3 text-white focus:outline-none focus:border-accent-gold appearance-none text-center font-bold"
                                >
                                    <option value="KGS">KG</option>
                                    <option value="LBS">LB</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        type="button"
                        onClick={generateSimBrief}
                        disabled={!departure || !arrival || !aircraftType}
                        className="w-full bg-gradient-to-r from-accent-gold to-yellow-500 text-dark-900 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <ExternalLink className="w-5 h-5" />
                        Generate SimBrief Flight Plan
                    </button>
                </div>

                {/* Flight Plan Preview / Bid Section */}
                <div className="glass-card p-6">
                    {!flightPlan ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 min-h-[400px]">
                            <Navigation className="w-16 h-16 mb-4 opacity-30" />
                            <p className="text-lg">No flight plan generated yet</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Navigation className="w-5 h-5 text-accent-gold" />
                                Flight Plan
                            </h2>

                            {/* Route Display */}
                            <div className="bg-dark-700/50 rounded-lg p-6 text-center">
                                <div className="flex items-center justify-center gap-6">
                                    <div>
                                        <p className="text-4xl font-mono font-bold text-accent-gold">{flightPlan.origin}</p>
                                        <p className="text-sm text-gray-400 mt-1">{flightPlan.originName}</p>
                                    </div>
                                    <Plane className="w-8 h-8 text-gray-500" />
                                    <div>
                                        <p className="text-4xl font-mono font-bold text-accent-gold">{flightPlan.destination}</p>
                                        <p className="text-sm text-gray-400 mt-1">{flightPlan.destName}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Flight Info */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-dark-700/50 rounded-lg p-4 text-center">
                                    <p className="text-gray-400 text-sm">Aircraft</p>
                                    <p className="text-white font-mono text-xl">{flightPlan.aircraft}</p>
                                </div>
                                <div className="bg-dark-700/50 rounded-lg p-4 text-center">
                                    <p className="text-gray-400 text-sm">Callsign</p>
                                    <p className="text-white font-mono text-xl">{callsign}</p>
                                </div>
                                <div className="bg-dark-700/50 rounded-lg p-4 text-center">
                                    <p className="text-gray-400 text-sm">Type</p>
                                    <p className="text-white text-xl capitalize">{flightType}</p>
                                </div>
                            </div>

                            {/* Bid Button */}
                            {!bidSuccess ? (
                                <button
                                    type="button"
                                    onClick={bidFlight}
                                    disabled={bidding}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-bold text-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Send className="w-5 h-5" />
                                    {bidding ? 'Bidding...' : 'Bid Flight to ACARS'}
                                </button>
                            ) : (
                                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                                    <p className="text-green-400 font-semibold text-lg">✓ Flight Bid Successful!</p>
                                    <p className="text-gray-400 text-sm mt-1">Your flight is available in ACARS.</p>
                                </div>
                            )}

                            {/* Reset Button */}
                            <button
                                type="button"
                                onClick={resetForm}
                                className="w-full bg-dark-700 hover:bg-white/10 text-gray-300 py-3 rounded-lg font-medium transition-colors border border-white/10"
                            >
                                Start New Flight Plan
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function DispatchPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
            </div>
        }>
            <DispatchContent />
        </Suspense>
    );
}
