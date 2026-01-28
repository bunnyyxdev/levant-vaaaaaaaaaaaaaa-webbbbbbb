import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Bid from '@/models/Bid';
import Pilot from '@/models/Pilot';

// POST - Create a new flight bid
export async function POST(request: NextRequest) {
    try {
        const session = await verifyAuth();
        await connectDB();

        const { departure, arrival, aircraft, callsign } = await request.json();

        if (!departure || !arrival || !aircraft) {
            return NextResponse.json(
                { error: 'Departure, arrival, and aircraft are required' },
                { status: 400 }
            );
        }

        // Get pilot info
        const pilot = await Pilot.findById(session.id);
        if (!pilot) {
            return NextResponse.json({ error: 'Pilot not found' }, { status: 404 });
        }

        // Cancel any existing active bids for this pilot
        await Bid.updateMany(
            { pilot_id: session.id, status: 'Active' },
            { status: 'Cancelled' }
        );

        // Create new bid
        const bid = await Bid.create({
            pilot_id: session.id,
            pilot_name: `${pilot.first_name} ${pilot.last_name}`,
            callsign: callsign || pilot.pilot_id,
            departure_icao: departure.toUpperCase(),
            arrival_icao: arrival.toUpperCase(),
            aircraft_type: aircraft,
        });

        return NextResponse.json({
            success: true,
            bid: {
                id: bid._id,
                callsign: bid.callsign,
                departure: bid.departure_icao,
                arrival: bid.arrival_icao,
                aircraft: bid.aircraft_type,
                expiresAt: bid.expires_at,
            }
        });
    } catch (error: any) {
        console.error('Bid creation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// GET - Get pilot's active bid
export async function GET() {
    try {
        const session = await verifyAuth();
        await connectDB();

        const bid = await Bid.findOne({ 
            pilot_id: session.id, 
            status: 'Active' 
        }).sort({ created_at: -1 });

        if (!bid) {
            return NextResponse.json({ bid: null });
        }

        return NextResponse.json({
            bid: {
                id: bid._id,
                callsign: bid.callsign,
                departure: bid.departure_icao,
                arrival: bid.arrival_icao,
                aircraft: bid.aircraft_type,
                createdAt: bid.created_at,
                expiresAt: bid.expires_at,
            }
        });
    } catch (error: any) {
        console.error('Get bid error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Cancel a bid
export async function DELETE(request: NextRequest) {
    try {
        const session = await verifyAuth();
        await connectDB();

        const { searchParams } = new URL(request.url);
        const bidId = searchParams.get('id');

        if (bidId) {
            await Bid.findOneAndUpdate(
                { _id: bidId, pilot_id: session.id },
                { status: 'Cancelled' }
            );
        } else {
            // Cancel all active bids
            await Bid.updateMany(
                { pilot_id: session.id, status: 'Active' },
                { status: 'Cancelled' }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Cancel bid error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
