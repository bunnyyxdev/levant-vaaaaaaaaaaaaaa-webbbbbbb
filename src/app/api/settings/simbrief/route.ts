import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Pilot from '@/models/Pilot';

export async function POST(request: NextRequest) {
    try {
        const session = await verifyAuth();
        await connectDB();
        
        const { simbriefId } = await request.json();

        await Pilot.findByIdAndUpdate(session.id, { 
            simbrief_id: simbriefId 
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Save SimBrief ID error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
