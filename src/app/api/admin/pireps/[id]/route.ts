import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Flight from '@/models/Flight';
import { verifyAuth } from '@/lib/auth';

// GET /api/admin/pireps/[id] - Get single PIREP details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        
        const session = await verifyAuth();
        if (!session || !session.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const pirep = await Flight.findById(id).lean();

        if (!pirep) {
            return NextResponse.json({ error: 'PIREP not found' }, { status: 404 });
        }

        return NextResponse.json({ pirep });
    } catch (error: any) {
        console.error('Error fetching PIREP:', error);
        return NextResponse.json({ error: 'Failed to fetch PIREP' }, { status: 500 });
    }
}

// PUT /api/admin/pireps/[id] - Update a PIREP
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        
        const session = await verifyAuth();
        if (!session || !session.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        const {
            flight_number,
            departure_icao,
            arrival_icao,
            alternate_icao,
            route,
            aircraft,
            comments,
            admin_comments,
            approved_status
        } = body;

        const updateData: any = {};
        if (flight_number !== undefined) updateData.flight_number = flight_number;
        if (departure_icao !== undefined) updateData.departure_icao = departure_icao.toUpperCase();
        if (arrival_icao !== undefined) updateData.arrival_icao = arrival_icao.toUpperCase();
        if (alternate_icao !== undefined) updateData.alternate_icao = alternate_icao.toUpperCase();
        if (route !== undefined) updateData.route = route.toUpperCase();
        if (aircraft !== undefined) updateData.aircraft = aircraft;
        if (comments !== undefined) updateData.comments = comments;
        if (admin_comments !== undefined) updateData.admin_comments = admin_comments;
        if (approved_status !== undefined) updateData.approved_status = parseInt(approved_status);

        const pirep = await Flight.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        ).lean();

        if (!pirep) {
            return NextResponse.json({ error: 'PIREP not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, pirep });
    } catch (error: any) {
        console.error('Error updating PIREP:', error);
        return NextResponse.json({ error: 'Failed to update PIREP' }, { status: 500 });
    }
}
