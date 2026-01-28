import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import Pilot from '@/models/Pilot';
import Counter from '@/models/Counter';
import QuizAttempt from '@/models/QuizAttempt';
import { QUIZ_COOLDOWN_MS } from '@/config/config';
import { sendPendingActivationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        
        const body = await request.json();
        const {
            firstName,
            lastName,
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

        // Check quiz cooldown if enabled
        if (QUIZ_COOLDOWN_MS > 0) {
            const attempt = await QuizAttempt.findOne({ email: email.toLowerCase() });
            if (attempt) {
                const cooldownEnd = new Date(attempt.last_attempt_at.getTime() + QUIZ_COOLDOWN_MS);
                if (new Date() < cooldownEnd) {
                    return NextResponse.json(
                        { error: 'Please wait before trying again', cooldownEnd },
                        { status: 429 }
                    );
                }
            }
        }

        // Generate sequential pilot ID using Counter
        const counter = await Counter.findOneAndUpdate(
            { _id: 'pilot_id' },
            { $inc: { seq: 1 } },
            { upsert: true, new: true }
        );
        const pilotId = `LVT${String(counter.seq).padStart(4, '0')}`;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new pilot with Pending status
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
            status: 'Pending', // New accounts require activation
            role: 'Pilot',
            is_admin: false,
            current_location: 'OLBA',
        });

        // Send pending activation email
        await sendPendingActivationEmail(email, pilotId, firstName);

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
