import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ActiveFlight from '@/models/ActiveFlight';

export async function GET() {
    try {
        await connectDB();

        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const flights = await ActiveFlight.find({
            last_update: { $gte: fiveMinutesAgo }
        }).sort({ last_update: -1 });

        const formattedFlights = flights.map(flight => ({
            callsign: flight.callsign,
            pilot: flight.pilot_name,
            departure: flight.departure_icao,
            arrival: flight.arrival_icao,
            equipment: flight.aircraft_type,
            status: flight.status,
        }));

        return NextResponse.json({ activeFlights: formattedFlights });

    } catch (error) {
        console.error('Active flights API Error:', error);
        return NextResponse.json({ activeFlights: [] });
    }
}
