import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ActiveFlight from '@/models/ActiveFlight';
import { unstable_cache } from 'next/cache';

const getActiveFlights = unstable_cache(
    async () => {
        await connectDB();
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const flights = await ActiveFlight.find({
            last_update: { $gte: fiveMinutesAgo }
        }).sort({ last_update: -1 });

        return flights.map(flight => ({
            callsign: flight.callsign,
            pilot: flight.pilot_name,
            departure: flight.departure_icao,
            arrival: flight.arrival_icao,
            equipment: flight.aircraft_type,
            latitude: flight.latitude,
            longitude: flight.longitude,
            altitude: flight.altitude,
            heading: flight.heading,
            groundSpeed: flight.ground_speed,
            status: flight.status,
        }));
    },
    ['active-flights'],
    { revalidate: 30 } // Cache for 30 seconds
);

export async function GET() {
    try {
        const formattedFlights = await getActiveFlights();
        return NextResponse.json({ activeFlights: formattedFlights });
    } catch (error) {
        console.error('Active flights API Error:', error);
        return NextResponse.json({ activeFlights: [] });
    }
}
