import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import Pilot from '@/models/Pilot';
import { sendAccountActivatedEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        
        const body = await request.json();
        const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

        const firstName = capitalize(body.firstName);
        const lastName = capitalize(body.lastName);
        const {
            email,
            password,
            phoneNumber,
            country,
            city,
            timezone,
            desiredCallsign,
        } = body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password || !country || !timezone) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await Pilot.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 400 }
            );
        }

        // Check if callsign is already taken as a pilot ID
        const callsign = desiredCallsign?.trim().toUpperCase();
        if (!callsign) {
            return NextResponse.json(
                { error: 'Callsign is required' },
                { status: 400 }
            );
        }

        const existingCallsign = await Pilot.findOne({ pilot_id: callsign });
        if (existingCallsign) {
            return NextResponse.json(
                { error: 'Callsign already in use' },
                { status: 400 }
            );
        }

        const pilotId = callsign;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new pilot with Active status (Key System removed)
        const newPilot = await Pilot.create({
            pilot_id: pilotId,
            first_name: firstName,
            last_name: lastName,
            email: email.toLowerCase(),
            password: hashedPassword,
            phone_number: phoneNumber,
            country,
            city,
            timezone,
            desired_callsign: desiredCallsign,
            rank: 'Cadet',
            status: 'Active', 
            role: 'Pilot',
            is_admin: false,
            current_location: 'OLBA',
        });

        // Send activation email
        await sendAccountActivatedEmail(email, pilotId, firstName);

        return NextResponse.json({
            success: true,
            message: 'Registration successful. Your account is pending activation.',
            pilotId: newPilot.pilot_id,
        });

    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
