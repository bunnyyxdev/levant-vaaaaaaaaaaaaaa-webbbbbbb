import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AcarsFile from '@/models/AcarsFile';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { unlink } from 'fs/promises';
import path from 'path';

import { jwtSecret, blobToken } from '@/config/config';

import { del } from '@vercel/blob';

async function isAdmin(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('lva_session')?.value;
    if (!token) return false;

    try {
        const secret = new TextEncoder().encode(jwtSecret);
        const { payload } = await jwtVerify(token, secret);
        return payload.isAdmin === true;
    } catch {
        return false;
    }
}

export async function GET() {
    try {
        await dbConnect();
        const files = await AcarsFile.find().sort({ uploadedAt: -1 });
        return NextResponse.json({ files });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    if (!(await isAdmin(request))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        await dbConnect();
        const file = await AcarsFile.findById(id);

        if (!file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // Delete from Vercel Blob
        try {
            await del(file.filePath, { token: blobToken });
        } catch (err) {
            console.error('Delete from Blob failed:', err);
        }

        await AcarsFile.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Deleted' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
