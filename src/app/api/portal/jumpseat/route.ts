import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Pilot from '@/models/Pilot';

const JUMPSEAT_DESTINATIONS = [
    { icao: 'OLBA', name: 'Beirut', cost: 250 },
    { icao: 'OERK', name: 'Riyadh', cost: 500 },
    { icao: 'OMDB', name: 'Dubai', cost: 750 },
    { icao: 'HECA', name: 'Cairo', cost: 600 },
    { icao: 'OJAI', name: 'Amman', cost: 300 },
    { icao: 'OSDI', name: 'Damascus', cost: 200 },
    { icao: 'LTFM', name: 'Istanbul', cost: 800 },
    { icao: 'OBBI', name: 'Bahrain', cost: 400 },
];

export async function POST(request: NextRequest) {
    try {
        const session = await verifyAuth();
        await connectDB();

        const { destinationIcao } = await request.json();
        
        const destination = JUMPSEAT_DESTINATIONS.find(d => d.icao === destinationIcao);
        if (!destination) {
            return NextResponse.json({ error: 'Invalid destination' }, { status: 400 });
        }

        const pilot = await Pilot.findById(session.id);
        if (!pilot) {
            return NextResponse.json({ error: 'Pilot not found' }, { status: 404 });
        }

        if (pilot.current_location === destinationIcao) {
            return NextResponse.json({ error: 'You are already at this location' }, { status: 400 });
        }

        if (pilot.total_credits < destination.cost) {
            return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
        }

        // Process jumpseat
        await Pilot.findByIdAndUpdate(session.id, {
            $inc: { total_credits: -destination.cost },
            current_location: destinationIcao,
            last_activity: new Date()
        });

        return NextResponse.json({
            success: true,
            message: `Successfully jumpseated to ${destination.name}`,
            newLocation: destinationIcao,
            remainingCredits: pilot.total_credits - destination.cost
        });
    } catch (error: any) {
        console.error('Jumpseat API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
