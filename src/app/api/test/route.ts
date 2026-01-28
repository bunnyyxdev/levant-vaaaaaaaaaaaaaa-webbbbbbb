import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({ message: 'Minimal API is working' });
}
