import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DestinationOfTheMonth from '@/models/DestinationOfTheMonth';

export async function GET() {
    try {
        await connectDB();
        const activeDotm = await DestinationOfTheMonth.findOne({ is_active: true }).sort({ updated_at: -1 });
        
        if (!activeDotm) {
            return NextResponse.json({ dotm: null });
        }

        return NextResponse.json({ dotm: activeDotm });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch active DOTM' }, { status: 500 });
    }
}
