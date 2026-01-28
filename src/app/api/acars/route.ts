import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Pilot from '@/models/Pilot';
import Flight from '@/models/Flight';
import ActiveFlight from '@/models/ActiveFlight';
import DestinationOfTheMonth from '@/models/DestinationOfTheMonth';
import Bid from '@/models/Bid';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { checkAndUpgradeRank } from '@/lib/ranks';

// Handle ACARS requests
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const data = await request.json();
        const { action, ...params } = data;

        switch (action) {
            case 'auth':
                return handleAuth(params);
            case 'position':
                return handlePosition(params);
            case 'bid':
                return handleGetBid(params);
            case 'pirep':
                return handlePirep(params);
            case 'start':
                return handleFlightStart(params);
            case 'end':
                return handleFlightEnd(params);
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('ACARS error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function handleGetBid(params: { pilotId: string }) {
    const { pilotId } = params;
    
    try {
        const pilot = await Pilot.findOne({ pilot_id: pilotId });
        if (!pilot) {
            return NextResponse.json({ error: 'Pilot not found' }, { status: 404 });
        }

        const BidModel = mongoose.models.Bid || mongoose.model('Bid'); 
        
        const bid = await BidModel.findOne({ 
            pilot_id: pilot._id, 
            status: 'Active' 
        }).sort({ created_at: -1 });

        if (!bid) {
            return NextResponse.json({ bid: null });
        }

        return NextResponse.json({
            success: true,
            bid: {
                id: bid._id,
                flight_number: bid.callsign.replace(pilot.pilot_id, ''),
                airline_code: 'LVT', 
                callsign: bid.callsign,
                departure_icao: bid.departure_icao,
                arrival_icao: bid.arrival_icao,
                aircraft_type: bid.aircraft_type,
                status: 'Active'
            }
        });

    } catch (error) {
        console.error('ACARS Get Bid Error:', error);
        return NextResponse.json({ error: 'Failed to fetch bid' }, { status: 500 });
    }
}

async function handleAuth(params: { pilotId: string; password: string }) {
    const { pilotId, password } = params;

    if (!pilotId || !password) {
        return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    try {
        const pilot = await Pilot.findOne({ 
            $or: [
                { pilot_id: pilotId },
                { email: pilotId.toLowerCase() }
            ]
        });

        if (pilot) {
            const valid = await bcrypt.compare(password, pilot.password);

            if (valid) {
                const sessionToken = Buffer.from(`${pilotId}:${Date.now()}`).toString('base64');

                return NextResponse.json({
                    success: true,
                    sessionToken,
                    pilot: {
                        id: pilot._id.toString(),
                        pilotId: pilot.pilot_id,
                        name: `${pilot.first_name} ${pilot.last_name}`,
                        rank: pilot.rank,
                        totalHours: pilot.total_hours,
                        firstName: pilot.first_name,
                        lastName: pilot.last_name
                    },
                });
            }
        }

        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    } catch (error) {
        console.error('ACARS Auth Error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}

async function handlePosition(params: {
    sessionToken: string;
    pilotId: string;
    callsign: string;
    latitude: number;
    longitude: number;
    altitude: number;
    heading: number;
    groundSpeed: number;
    status: string;
}) {
    const { pilotId, callsign, latitude, longitude, altitude, heading, groundSpeed, status } = params;

    try {
        await ActiveFlight.findOneAndUpdate(
            { pilot_id: pilotId, callsign },
            {
                latitude,
                longitude,
                altitude,
                heading,
                ground_speed: groundSpeed,
                status,
                last_update: new Date()
            }
        );
    } catch (error) {
        console.error('ACARS Position Update Error:', error);
    }

    return NextResponse.json({ success: true });
}

async function handleFlightStart(params: {
    sessionToken: string;
    pilotId: string;
    callsign: string;
    departureIcao: string;
    arrivalIcao: string;
    aircraftType: string;
}) {
    const { pilotId, callsign, departureIcao, arrivalIcao, aircraftType } = params;

    try {
        const pilot = await Pilot.findOne({ pilot_id: pilotId });
        const pilotName = pilot ? `${pilot.first_name} ${pilot.last_name}` : 'Unknown Pilot';

        await ActiveFlight.create({
            pilot_id: pilot?._id,
            pilot_name: pilotName,
            callsign,
            departure_icao: departureIcao,
            arrival_icao: arrivalIcao,
            aircraft_type: aircraftType,
            latitude: 0,
            longitude: 0,
            status: 'Preflight',
            started_at: new Date(),
            last_update: new Date()
        });
    } catch (error) {
        console.error('ACARS Flight Start Error:', error);
    }

    return NextResponse.json({ success: true, message: 'Flight started' });
}

async function handleFlightEnd(params: { pilotId: string; callsign: string }) {
    const { pilotId, callsign } = params;

    try {
        const pilot = await Pilot.findOne({ pilot_id: pilotId });
        if (pilot) {
            await ActiveFlight.deleteOne({ pilot_id: pilot._id, callsign });
        }
    } catch (error) {
        console.error('ACARS Flight End Error:', error);
    }

    return NextResponse.json({ success: true, message: 'Flight ended' });
}

async function handlePirep(params: {
    sessionToken: string;
    pilotId: string;
    flightNumber?: string;
    callsign: string;
    departureIcao: string;
    arrivalIcao: string;
    alternateIcao?: string;
    route?: string;
    aircraftType: string;
    flightTimeMinutes: number;
    landingRate: number;
    fuelUsed: number;
    distanceNm: number;
    pax?: number;
    cargo?: number;
    score?: number;
    comments?: string;
}) {
    const {
        pilotId,
        flightNumber,
        callsign,
        departureIcao,
        arrivalIcao,
        alternateIcao,
        route,
        aircraftType,
        flightTimeMinutes,
        landingRate,
        fuelUsed,
        distanceNm,
        pax,
        cargo,
        score,
        comments
    } = params;

    try {
        const pilot = await Pilot.findOne({ pilot_id: pilotId });
        if (!pilot) {
            return NextResponse.json({ error: 'Pilot not found' }, { status: 404 });
        }

        // 1. Create flight report
        await Flight.create({
            pilot_id: pilot._id,
            pilot_name: `${pilot.first_name} ${pilot.last_name}`,
            flight_number: flightNumber || 'N/A',
            callsign,
            departure_icao: departureIcao,
            arrival_icao: arrivalIcao,
            alternate_icao: alternateIcao,
            route: route,
            aircraft_type: aircraftType,
            flight_time: flightTimeMinutes,
            landing_rate: landingRate,
            fuel_used: fuelUsed,
            distance: distanceNm,
            pax: pax || 0,
            cargo: cargo || 0,
            score: score || 100,
            approved_status: 0, // Pending
            comments: comments,
            submitted_at: new Date()
        });

        // 2. Calculate points: 10 per minute + 5 per NM
        let pointsEarned = Math.round((flightTimeMinutes * 10) + (distanceNm * 5));

        // DOTM Bonus Check
        const activeDotm = await DestinationOfTheMonth.findOne({ is_active: true });
        let dotmBonus = 0;
        
        if (activeDotm) {
            // Check if departure or arrival matches DOTM ICAO
            if (departureIcao === activeDotm.icao || arrivalIcao === activeDotm.icao) {
                dotmBonus = activeDotm.bonus_points;
                pointsEarned += dotmBonus;
            }
        }

        // 3. Update pilot stats
        await Pilot.findByIdAndUpdate(pilot._id, {
            $inc: {
                total_flights: 1,
                total_hours: flightTimeMinutes / 60,
                total_credits: pointsEarned
            },
            current_location: arrivalIcao,
            last_activity: new Date()
        });

        // 4. Remove from active flights
        await ActiveFlight.deleteOne({ pilot_id: pilot._id, callsign });

        // 5. Check for Rank Upgrade
        const newRank = await checkAndUpgradeRank(pilot._id.toString());
        
        let message = `PIREP submitted! You earned ${pointsEarned.toLocaleString()} points.`;
        if (dotmBonus > 0) message += ` (Includes ${dotmBonus} DOTM Bonus!)`;
        if (newRank) message += ` CONGRATULATIONS! You have been promoted to ${newRank}!`;

        return NextResponse.json({ 
            success: true, 
            message,
            pointsEarned,
            newRank
        });

    } catch (error) {
        console.error('ACARS PIREP Error:', error);
        return NextResponse.json({ error: 'Failed to submit PIREP' }, { status: 500 });
    }
}

// GET - Get ACARS status/info
export async function GET() {
    return NextResponse.json({
        name: 'Levant Virtual Airlines ACARS API',
        version: '1.0.0',
        status: 'online',
        database: 'MongoDB',
        endpoints: {
            auth: 'POST /api/acars { action: "auth", pilotId, password }',
            bid: 'POST /api/acars { action: "bid", pilotId }',
            start: 'POST /api/acars { action: "start", sessionToken, pilotId, callsign, departureIcao, arrivalIcao, aircraftType }',
            position: 'POST /api/acars { action: "position", sessionToken, pilotId, callsign, latitude, longitude, altitude, heading, groundSpeed, status }',
            pirep: 'POST /api/acars { action: "pirep", sessionToken, pilotId, callsign, departureIcao, arrivalIcao, aircraftType, flightTimeMinutes, landingRate, fuelUsed, distanceNm }',
            end: 'POST /api/acars { action: "end", pilotId, callsign }',
        },
    });
}
