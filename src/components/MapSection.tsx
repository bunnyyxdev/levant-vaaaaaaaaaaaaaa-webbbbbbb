'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./Map'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-dark-700">
            <div className="text-gray-400">Loading map...</div>
        </div>
    ),
});

interface Flight {
    id: number;
    callsign: string;
    pilot_name?: string;
    latitude: number;
    longitude: number;
    altitude: number;
    heading: number;
    ground_speed: number;
    departure_icao: string;
    arrival_icao: string;
    status: string;
    aircraft_type: string;
}

export default function MapSection() {
    const [flights, setFlights] = useState<Flight[]>([]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        
        const fetchFlights = async () => {
            // Don't fetch if the page is hidden (optimization)
            if (document.hidden) return;

            try {
                const response = await fetch('/api/flights');
                if (response.ok) {
                    const data = await response.json();
                    if (data.flights && Array.isArray(data.flights)) {
                        setFlights(data.flights);
                    } else {
                        setFlights([]);
                    }
                }
            } catch (error) {
                console.error('Error fetching flights:', error);
            }
        };

        fetchFlights();
        
        // Polling every 20 seconds (optimized from 10s)
        interval = setInterval(fetchFlights, 20000);

        const handleVisibilityChange = () => {
            if (document.hidden) {
                clearInterval(interval);
            } else {
                fetchFlights();
                interval = setInterval(fetchFlights, 20000);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return (
        <section id="map" className="py-24 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                        Live Flight Map
                    </h2>
                    <div className="divider" />
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Track our pilots in real-time as they explore the skies of the Middle East and beyond.
                    </p>
                </div>

                {/* Map Container */}
                <div className="overflow-hidden h-[600px] relative w-full">
                    <Map flights={flights} />
                </div>
            </div>
        </section>
    );
}
