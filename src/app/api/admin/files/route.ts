import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { list, del } from '@vercel/blob';
import { jwtSecret, blobToken } from '@/config/config';

async function isAdmin(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('lva_session')?.value;
    if (!token) return false;

    try {
        const secret = new TextEncoder().encode(jwtSecret);
        const { payload } = await jwtVerify(token, secret);
        return payload.isAdmin === true || payload.role === 'Admin';
    } catch {
        return false;
    }
}

export async function GET(request: NextRequest) {
    if (!(await isAdmin(request))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { blobs } = await list({ token: blobToken });
        return NextResponse.json({ files: blobs });
    } catch (error: any) {
        console.error('Blob list error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    if (!(await isAdmin(request))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');

        if (!url) {
            return NextResponse.json({ error: 'URL required' }, { status: 400 });
        }

        await del(url, { token: blobToken });
        return NextResponse.json({ success: true, message: 'File deleted from storage' });
    } catch (error: any) {
        console.error('Blob delete error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
