import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AcarsFile from '@/models/AcarsFile';

export async function GET() {
    try {
        await dbConnect();
        
        // Fetch the latest exe and zip versions
        const latestExe = await AcarsFile.findOne({ type: 'exe' }).sort({ uploadedAt: -1 });
        const latestZip = await AcarsFile.findOne({ type: 'zip' }).sort({ uploadedAt: -1 });

        const files = [];
        if (latestExe) files.push(latestExe);
        if (latestZip) files.push(latestZip);

        return NextResponse.json({ files });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
