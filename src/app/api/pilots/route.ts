import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Pilot from '@/models/Pilot';
import Flight from '@/models/Flight';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const pilotId = searchParams.get('id');

    try {
        await connectDB();

        if (pilotId) {
            // Try lookup by pilot_id first
            let pilot: any = await Pilot.findOne({ pilot_id: pilotId }).select('-password');

            // Fallback: If LEV prefix is used, try LVT
            if (!pilot && pilotId.startsWith('LEV')) {
                const migratedId = pilotId.replace('LEV', 'LVT');
                pilot = await Pilot.findOne({ pilot_id: migratedId }).select('-password');
            }

            // If not found and pilotId looks like an ObjectId, try lookup by _id
            if (!pilot && pilotId.match(/^[0-9a-fA-F]{24}$/)) {
                pilot = await Pilot.findById(pilotId).select('-password');
            }

            if (pilot) {
                // Get flight stats (landing average)
                const flights = await Flight.find({ pilot_id: pilot._id });

                let totalLandingRate = 0;
                let count = 0;
                flights.forEach(f => {
                    if (f.landing_rate) {
                        totalLandingRate += f.landing_rate;
                        count++;
                    }
                });

                return NextResponse.json({
                    pilot: {
                        id: pilot._id.toString(),
                        pilot_id: pilot.pilot_id,
                        first_name: pilot.first_name,
                        last_name: pilot.last_name,
                        email: pilot.email,
                        phone_number: pilot.phone_number,
                        rank: pilot.rank,
                        status: pilot.status,
                        role: pilot.role,
                        total_hours: pilot.total_hours,
                        transfer_hours: pilot.transfer_hours || 0,
                        total_flights: pilot.total_flights,
                        total_credits: pilot.total_credits,
                        current_location: pilot.current_location,
                        country: pilot.country,
                        city: pilot.city,
                        timezone: pilot.timezone,
                        desired_callsign: pilot.desired_callsign,
                        created_at: pilot.created_at,
                        average_landing: count > 0 ? Math.round(totalLandingRate / count) : 0
                    }
                });
            }
            return NextResponse.json({ error: 'Pilot not found' }, { status: 404 });
        }

        return NextResponse.json({ pilots: [] });
    } catch (error) {
        console.error('Error fetching pilot:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const data = await request.json();
        const { pilotId, updates } = data;

        if (!pilotId) return NextResponse.json({ error: 'Pilot ID required' }, { status: 400 });

        // Find the pilot
        const pilot = await Pilot.findOne({ pilot_id: pilotId });
        if (!pilot) {
            return NextResponse.json({ error: 'Pilot not found' }, { status: 404 });
        }

        const allowedFields = ['country', 'timezone', 'ivao_id', 'vatsim_id', 'simbrief_id', 'email_opt_in', 'avatar_url', 'city', 'phone_number'];
        const cleanUpdates: any = {};

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                cleanUpdates[key] = value;
            }
        }

        if (Object.keys(cleanUpdates).length > 0) {
            await Pilot.findByIdAndUpdate(pilot._id, cleanUpdates);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Update error:', error);
        return NextResponse.json({ error: 'Failed to update pilot: ' + error.message }, { status: 500 });
    }
}
