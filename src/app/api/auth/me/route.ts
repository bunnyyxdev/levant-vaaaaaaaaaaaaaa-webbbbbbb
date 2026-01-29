import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { jwtSecret } from '@/config/config';
import connectDB from '@/lib/mongodb';
import Pilot from '@/models/Pilot';

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('lva_session')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const secret = new TextEncoder().encode(jwtSecret);
        const { payload } = await jwtVerify(token, secret);

        // Fetch additional user data from database
        await connectDB();
        const pilot = await Pilot.findById(payload.id).select('simbrief_id pilot_id');

        return NextResponse.json({
            user: {
                id: payload.id,
                pilotId: pilot?.pilot_id || payload.pilotId, // Always use DB value as source of truth
                email: payload.email,
                isAdmin: payload.isAdmin,
                role: payload.role,
                status: payload.status,
                simbriefId: pilot?.simbrief_id || '',
            }
        });
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
}
