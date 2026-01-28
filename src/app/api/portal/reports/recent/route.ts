import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Flight from '@/models/Flight';

export async function GET() {
    try {
        const session = await verifyAuth();
        await connectDB();

        const flights = await Flight.find({ pilot_id: session.id })
            .sort({ submitted_at: -1 })
            .limit(10);

        const formattedReports = flights.map(flight => {
            const f = flight.toObject();
            return {
                ...f,
                id: `PIREP-${flight._id.toString().slice(-6).toUpperCase()}`,
                route: `${flight.departure_icao} → ${flight.arrival_icao}`,
                aircraft: flight.aircraft_type, // keep for backward compat if needed
                date: new Date(flight.submitted_at).toLocaleDateString(),
                status: flight.approved_status === 1 ? 'Accepted' : flight.approved_status === 2 ? 'Rejected' : 'Pending',
                approved_status: flight.approved_status,
            };
        });

        return NextResponse.json({ flights: formattedReports });

    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 401 });
        }
        console.error('Recent reports API Error:', error);
        return NextResponse.json({ reports: [] });
    }
}
