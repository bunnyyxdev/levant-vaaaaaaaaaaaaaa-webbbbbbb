import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Pilot from '@/models/Pilot';
import { unstable_cache } from 'next/cache';

const getNewestPilots = unstable_cache(
    async () => {
        await connectDB();
        const pilots = await Pilot.find()
            .sort({ created_at: -1 })
            .limit(5)
            .select('pilot_id first_name last_name created_at rank');
        
        return pilots.map(pilot => ({
            id: pilot.pilot_id,
            name: `${pilot.first_name} ${pilot.last_name}`,
            joined: new Date(pilot.created_at).toLocaleDateString(),
            rank: pilot.rank,
        }));
    },
    ['newest-pilots'],
    { revalidate: 300 } // Cache for 5 minutes
);

export async function GET() {
    try {
        const formattedPilots = await getNewestPilots();
        return NextResponse.json({ pilots: formattedPilots });
    } catch (error) {
        console.error('New pilots API Error:', error);
        return NextResponse.json({ pilots: [] });
    }
}
