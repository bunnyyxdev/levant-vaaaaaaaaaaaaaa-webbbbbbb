import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Pilot from '@/models/Pilot';

export async function GET() {
    try {
        const session = await verifyAuth();
        await connectDB();

        const pilot = await Pilot.findById(session.id);

        if (!pilot) {
            return NextResponse.json({ error: 'Pilot not found' }, { status: 404 });
        }

        const stats = [
            { label: 'Your Location', value: pilot.current_location || '----', icon: '📍', color: 'from-blue-500 to-blue-700' },
            { label: 'Total Hours', value: pilot.total_hours?.toString() || '0', icon: '⏱️', color: 'from-green-500 to-green-700' },
            { label: 'Total Credits', value: pilot.total_credits?.toLocaleString() || '0', icon: '💰', color: 'from-yellow-500 to-yellow-700' },
            { label: 'Landing Average', value: pilot.landing_avg ? `${Math.round(pilot.landing_avg)} fpm` : '----', icon: '✈️', color: 'from-purple-500 to-purple-700' },
        ];

        return NextResponse.json({ stats });

    } catch (error: any) {
        if (error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 401 });
        }
        console.error('Stats API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
