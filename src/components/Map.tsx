'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
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

interface MapProps {
    flights: Flight[];
}

export default function Map({ flights }: MapProps) {
    return (
        <MapContainer
            center={[29.0, 40.0]}
            zoom={4}
            className="h-full w-full"
            style={{ background: '#1a1a2e' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {flights.map((flight) => (
                <Marker
                    key={flight.id}
                    position={[flight.latitude, flight.longitude]}
                    icon={
                        L.divIcon({
                            html: `<img src="/img/aircraft.png" style="transform: rotate(${flight.heading}deg); width: 100%; height: 100%; object-fit: contain;" />`,
                            className: '',
                            iconSize: [32, 32],
                            iconAnchor: [16, 16],
                            popupAnchor: [0, -16]
                        })
                    }
                >
                    <Popup>
                        <div className="text-dark-900 text-sm">
                            <strong className="text-base">{flight.callsign}</strong>
                            <div className="border-t border-gray-300 my-1"></div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                <span className="font-semibold">Dep:</span> <span>{flight.departure_icao}</span>
                                <span className="font-semibold">Arr:</span> <span>{flight.arrival_icao}</span>
                                <span className="font-semibold">Alt:</span> <span>{flight.altitude}ft</span>
                                <span className="font-semibold">Spd:</span> <span>{flight.ground_speed}kts</span>
                                <span className="font-semibold">Type:</span> <span>{flight.aircraft_type}</span>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
