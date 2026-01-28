import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Pilot from '@/models/Pilot';
import Flight from '@/models/Flight';
import ActiveFlight from '@/models/ActiveFlight';

export async function GET() {
    try {
        const session = await verifyAuth();
        await connectDB();
        
        if (!session.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const totalPilots = await Pilot.countDocuments();
        const activeFlights = await ActiveFlight.countDocuments();
        const totalFlights = await Flight.countDocuments();
        const pendingPireps = await Flight.countDocuments({ approved_status: 0 });

        return NextResponse.json({
            stats: {
                totalPilots,
                activeFlights,
                totalFlights,
                pendingPireps
            }
        });
    } catch (error: any) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
