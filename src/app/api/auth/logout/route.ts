import { NextResponse } from 'next/server';

export async function GET() {
    const response = NextResponse.redirect(new URL('/', 'https://test.levant-va.com'));
    
    // Clear the auth cookie
    response.cookies.set('auth_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0, // Expire immediately
    });

    return response;
}
