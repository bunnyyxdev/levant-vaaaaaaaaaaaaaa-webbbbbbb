import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import connectDB from '@/lib/mongodb';
import Pilot from '@/models/Pilot';
import { jwtSecret } from '@/config/config';

export async function POST(request: NextRequest) {
    try {
        console.log('Login attempt starting...');
        await connectDB();
        console.log('MongoDB connected');
        
        const { email, password } = await request.json();
        
        console.log('Login attempt for:', email);

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Fetch user from MongoDB
        const user = await Pilot.findOne({ email: email.toLowerCase() });
        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
            console.log('No user found with email:', email.toLowerCase());
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Check account status
        if (user.status === 'Blacklist') {
            return NextResponse.json(
                { error: 'Your account has been blacklisted. Contact administrator.' },
                { status: 403 }
            );
        }

        // Update last activity and restore status if needed
        user.last_activity = new Date();
        if (user.status === 'On leave (LOA)' || user.status === 'Inactive') {
            user.status = 'Active';
        }
        await user.save();

        // Create JWT
        const secret = new TextEncoder().encode(jwtSecret);
        const token = await new SignJWT({
            id: user._id.toString(),
            pilotId: user.pilot_id,
            isAdmin: user.is_admin,
            email: user.email,
            status: user.status,
            role: user.role,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(secret);

        // Create response
        const response = NextResponse.json({
            success: true,
            user: {
                id: user._id.toString(),
                pilotId: user.pilot_id,
                firstName: user.first_name,
                lastName: user.last_name,
                isAdmin: user.is_admin,
                role: user.role,
            }
        });

        // Set Cookie
        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Only secure in production
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, 
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
