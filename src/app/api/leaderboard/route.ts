import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Pilot from '@/models/Pilot';

export async function GET() {
    try {
        await connectDB();
        
        const pilots = await Pilot.find({ status: 'Active' })
            .select('pilot_id first_name last_name total_hours total_flights rank')
            .sort({ total_hours: -1 })
            .limit(20);

        const leaderboard = pilots.map((pilot, index) => ({
            rank: index + 1,
            pilotId: pilot.pilot_id,
            name: `${pilot.first_name} ${pilot.last_name}`,
            hours: pilot.total_hours || 0,
            flights: pilot.total_flights || 0,
            pilotRank: pilot.rank || 'Cadet',
        }));

        return NextResponse.json({ pilots: leaderboard });
    } catch (error: any) {
        console.error('Leaderboard error:', error);
        return NextResponse.json({ pilots: [] });
    }
}
