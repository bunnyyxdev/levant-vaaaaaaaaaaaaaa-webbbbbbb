import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DestinationOfTheMonth from '@/models/DestinationOfTheMonth';

export async function GET() {
    try {
        await connectDB();
        const dotms = await DestinationOfTheMonth.find().sort({ created_at: -1 });
        return NextResponse.json({ dotms });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch DOTMs' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const data = await request.json();
        
        // If setting as active, deactivate others (optional logic, but good for UX)
        if (data.is_active) {
            await DestinationOfTheMonth.updateMany({}, { is_active: false });
        }

        const dotm = await DestinationOfTheMonth.create(data);
        return NextResponse.json({ success: true, dotm });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create DOTM' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const data = await request.json();
        const { id, updates } = data;

        if (updates.is_active) {
            await DestinationOfTheMonth.updateMany({}, { is_active: false });
        }

        const dotm = await DestinationOfTheMonth.findByIdAndUpdate(id, updates, { new: true });
        return NextResponse.json({ success: true, dotm });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update DOTM' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await DestinationOfTheMonth.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete DOTM' }, { status: 500 });
    }
}
