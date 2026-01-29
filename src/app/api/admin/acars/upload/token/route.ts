import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { jwtSecret, blobToken } from '@/config/config';

async function isAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return false;

    try {
        const secret = new TextEncoder().encode(jwtSecret);
        const { payload } = await jwtVerify(token, secret);
        return payload.isAdmin === true;
    } catch {
        return false;
    }
}

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname) => {
                // Check if user is admin
                if (!(await isAdmin())) {
                    throw new Error('Unauthorized');
                }

                return {
                    allowedContentTypes: [
                        'application/vnd.microsoft.portable-executable',
                        'application/zip',
                        'application/octet-stream',
                        'application/x-zip-compressed'
                    ],
                    token: blobToken, // Pass the token from config
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                // This is called on the server after the upload is completed
                console.log('Blob upload completed', blob, tokenPayload);
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 }
        );
    }
}
