import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { jwtSecret } from './config/config';
import { checkRateLimit } from './lib/rateLimit';

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Rate Limiting for API Routes
    if (pathname.startsWith('/api')) {
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const limit = checkRateLimit(ip, { limit: 60, windowMs: 60 * 1000 }); // 60 requests per minute

        if (!limit.success) {
            return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
                status: 429,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') || // Keep skipping API for the Login Redirect logic below
        pathname.startsWith('/img') ||
        pathname === '/blacklist'
    ) {
        return NextResponse.next();
    }

    const token = request.cookies.get('auth_token')?.value;

    if (token) {
        try {
            const secret = new TextEncoder().encode(jwtSecret);
            const { payload } = await jwtVerify(token, secret);

            // Check if user is blacklisted (stored in JWT for performance)
            if (payload.status === 'Blacklist') {
                return NextResponse.rewrite(new URL('/404', request.url));
            }

        } catch (error) {
            // Token invalid - clear it and redirect to login if on protected route
            const response = pathname.startsWith('/portal')
                ? NextResponse.redirect(new URL('/login', request.url))
                : NextResponse.next();
            response.cookies.delete('auth_token');
            return response;
        }
    } else {
        // Protected routes check
        if (pathname.startsWith('/portal')) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    // Updated matcher to include API routes so middleware runs on them
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
