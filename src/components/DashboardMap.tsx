'use client';

import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons if we were using them (we aren't yet, but good practice)
import L from 'leaflet';

export default function DashboardMap() {
    return (
        <MapContainer
            center={[29.0, 40.0]}
            zoom={4}
            className="h-full w-full"
            style={{ background: '#1a1a2e' }}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
        </MapContainer>
    );
}
