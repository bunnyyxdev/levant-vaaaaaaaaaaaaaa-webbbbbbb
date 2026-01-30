'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: (markerIcon as any).src || markerIcon,
    shadowUrl: (markerShadow as any).src || markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Flight {
    callsign: string;
    pilot: string;
    departure: string;
    arrival: string;
    equipment: string;
    latitude: number;
    longitude: number;
    altitude: number;
    heading: number;
    groundSpeed: number;
    status: string;
}

const createAircraftIcon = (heading: number) => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="transform: rotate(${heading - 45}deg); color: #eab308;">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>
               </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
};

export default function DashboardMap() {
    const [flights, setFlights] = useState<Flight[]>([]);

    useEffect(() => {
        const fetchFlights = async () => {
            try {
                const res = await fetch('/api/portal/active-flights');
                const data = await res.json();
                if (data.activeFlights) {
                    setFlights(data.activeFlights);
                }
            } catch (err) {
                console.error('Map fetch error:', err);
            }
        };

        fetchFlights();
        const interval = setInterval(fetchFlights, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <MapContainer
                center={[20.0, 0.0]}
                zoom={2.5}
                className="h-full w-full"
                style={{ background: '#0a0a0f' }}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                
                {flights.map((flight) => (
                    <Marker 
                        key={flight.callsign} 
                        position={[flight.latitude, flight.longitude]}
                        icon={createAircraftIcon(flight.heading)}
                    >
                        <Popup>
                            <div className="p-2 text-dark font-sans">
                                <p className="font-bold text-accent-gold text-lg mb-1">{flight.callsign}</p>
                                <div className="space-y-1 text-xs">
                                    <p><span className="text-gray-500">Pilot:</span> <span className="text-dark-900 font-medium">{flight.pilot}</span></p>
                                    <p><span className="text-gray-500">Route:</span> <span className="text-dark-900 font-medium">{flight.departure} → {flight.arrival}</span></p>
                                    <p><span className="text-gray-500">Altitude:</span> <span className="text-dark-900 font-medium">{Math.round(flight.altitude).toLocaleString()} FT</span></p>
                                    <p><span className="text-gray-500">Speed:</span> <span className="text-dark-900 font-medium">{Math.round(flight.groundSpeed)} KTS</span></p>
                                    <p className="border-t border-gray-100 pt-1 mt-1 font-bold text-accent-gold-dark uppercase tracking-tighter">{flight.status}</p>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
            <style jsx global>{`
                .leaflet-popup-content-wrapper {
                    background: white;
                    color: #1a1a2e;
                    border-radius: 8px;
                    padding: 0;
                }
                .leaflet-popup-content {
                    margin: 0;
                }
                .custom-div-icon {
                    background: none;
                    border: none;
                }
            `}</style>
        </>
    );
}
