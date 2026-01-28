import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Flight from '@/models/Flight';
import Pilot from '@/models/Pilot';

export async function GET(request: NextRequest) {
    try {
        const session = await verifyAuth();
        await connectDB();
        
        if (!session.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const statusParam = searchParams.get('status'); // 'Pending', 'Approved', 'Rejected' or 0, 1, 2
        
        let query: any = {};
        if (statusParam !== null) {
            if (statusParam === 'Pending') query.approved_status = 0;
            else if (statusParam === 'Accepted' || statusParam === 'Approved') query.approved_status = 1;
            else if (statusParam === 'Rejected' || statusParam === 'Denied') query.approved_status = 2;
            else if (!isNaN(parseInt(statusParam))) query.approved_status = parseInt(statusParam);
        } else {
            query.approved_status = 0; // Default to pending
        }

        const flights = await Flight.find(query)
            .sort({ submitted_at: -1 })
            .limit(100);

        return NextResponse.json({ flights });
    } catch (error: any) {
        console.error('Admin reports GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await verifyAuth();
        await connectDB();
        
        if (!session.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { flightId, status, approved_status } = body;

        let newStatus = approved_status;
        if (newStatus === undefined && status) {
             if (status === 'Accepted' || status === 'Approved') newStatus = 1;
             else if (status === 'Rejected' || status === 'Denied') newStatus = 2;
             else newStatus = 0;
        }

        if (![1, 2].includes(newStatus)) {
            // allowing 0 (pending) might be okay too but typically PUT is to approve/reject
        }

        const flight = await Flight.findById(flightId);
        if (!flight) {
            return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
        }

        // Update flight status
        await Flight.findByIdAndUpdate(flightId, { approved_status: newStatus });

        return NextResponse.json({ success: true, message: `Flight updated successfully` });
    } catch (error: any) {
        console.error('Admin reports PUT error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
