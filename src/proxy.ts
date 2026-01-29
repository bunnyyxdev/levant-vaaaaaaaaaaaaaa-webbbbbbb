import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { jwtSecret } from './config/config';

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // 1. Skip checks for static assets and public APIs
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/') || 
        pathname.startsWith('/img/') ||
        pathname === '/blacklist' ||
        pathname === '/favicon.ico' ||
        /\.(ico|png|jpg|jpeg|svg|css|js|woff2?|webp|mp4|json)$/i.test(pathname)
    ) {
        return NextResponse.next();
    }

    const rawToken = request.cookies.get('lva_session')?.value;
    let token = rawToken?.trim();

    // Fix for potential quote wrapping in some environments
    if (token && token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
    }

    if (token) {
        try {
            const secret = new TextEncoder().encode(jwtSecret);
            const { payload } = await jwtVerify(token, secret);

            // Check if user is blacklisted
            if (payload.status === 'Blacklist') {
                return NextResponse.rewrite(new URL('/404', request.url));
            }

            // Advanced Function: Admin Route Protection
            if (pathname.startsWith('/portal/admin')) {
                const isAdmin = payload.isAdmin === true || payload.role === 'Admin';
                if (!isAdmin) {
                    // Redirect non-admins away from admin pages
                    return NextResponse.redirect(new URL('/portal/dashboard', request.url));
                }
            }

            // If we are at /login but have a valid token, go to portal
            if (pathname === '/login') {
                return NextResponse.redirect(new URL('/portal/dashboard', request.url));
            }

        } catch (error: any) {
            // Token invalid or expired
            if (pathname.startsWith('/portal')) {
                const response = NextResponse.redirect(new URL('/login', request.url));
                response.cookies.set('lva_session', '', { path: '/', maxAge: 0 });
                return response;
            }

            const response = NextResponse.next();
            response.cookies.set('lva_session', '', { path: '/', maxAge: 0 });
            return response;
        }
    } else {
        // No token, check if route is protected
        if (pathname.startsWith('/portal')) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export default proxy;

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|img).*)'],
};
