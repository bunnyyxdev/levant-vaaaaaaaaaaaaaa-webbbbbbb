import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PilotAward from '@/models/PilotAward';
import Award from '@/models/Award';
import Pilot from '@/models/Pilot';
import { verifyAuth } from '@/lib/auth';

// GET /api/admin/badges - List all pilot badges + all awards + pilots for management
export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        
        const session = await verifyAuth();
        if (!session || !session.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const [awards, pilotAwards, pilots] = await Promise.all([
            Award.find({ active: true }).sort({ order: 1, name: 1 }).lean(),
            PilotAward.find({}).populate('award_id').populate('pilot_id', 'pilot_id first_name last_name').lean(),
            Pilot.find({}).select('_id pilot_id first_name last_name').sort({ pilot_id: 1 }).lean()
        ]);
        
        return NextResponse.json({ awards, pilotAwards, pilots });
    } catch (error: any) {
        console.error('Error fetching admin badges:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

// POST /api/admin/badges - Assign a badge to a pilot
export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        
        const session = await verifyAuth();
        if (!session || !session.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { pilotId, awardId } = await request.json();
        
        if (!pilotId || !awardId) {
            return NextResponse.json({ error: 'Missing pilotId or awardId' }, { status: 400 });
        }
        
        // Check if already assigned
        const existing = await PilotAward.findOne({ pilot_id: pilotId, award_id: awardId });
        if (existing) {
            return NextResponse.json({ error: 'Pilot already has this badge' }, { status: 400 });
        }
        
        const pilotAward = new PilotAward({
            pilot_id: pilotId,
            award_id: awardId,
            earned_at: new Date()
        });
        
        await pilotAward.save();
        
        return NextResponse.json({ success: true, pilotAward });
    } catch (error: any) {
        console.error('Error assigning badge:', error);
        return NextResponse.json({ error: 'Failed to assign badge' }, { status: 500 });
    }
}

// DELETE /api/admin/badges - Remove a badge from a pilot
export async function DELETE(request: NextRequest) {
    try {
        await dbConnect();
        
        const session = await verifyAuth();
        if (!session || !session.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { searchParams } = new URL(request.url);
        const pilotAwardId = searchParams.get('id');
        
        if (!pilotAwardId) {
            return NextResponse.json({ error: 'Missing badge assignment ID' }, { status: 400 });
        }
        
        await PilotAward.findByIdAndDelete(pilotAwardId);
        
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error removing badge:', error);
        return NextResponse.json({ error: 'Failed to remove badge' }, { status: 500 });
    }
}
