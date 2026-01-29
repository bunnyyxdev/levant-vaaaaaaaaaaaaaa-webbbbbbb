import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { jwtSecret } from './config/config';

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const rawToken = request.cookies.get('auth_token')?.value;
    const token = rawToken?.trim();

    // 1. Skip checks for static assets and public APIs
    // Using a more comprehensive regex for static assets
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

    if (token) {
        try {
            const secret = new TextEncoder().encode(jwtSecret);
            const { payload } = await jwtVerify(token, secret);

            // Check if user is blacklisted
            if (payload.status === 'Blacklist') {
                return NextResponse.rewrite(new URL('/404', request.url));
            }

            // If we are at /login but have a valid token, go to portal
            if (pathname === '/login') {
                return NextResponse.redirect(new URL('/portal/dashboard', request.url));
            }

        } catch (error: any) {
            // Only log actual verification errors if they are not common expired/invalid cases
            // Or just clear the cookie silently if it's a portal route
            
            if (pathname.startsWith('/portal')) {
                const response = NextResponse.redirect(new URL('/login', request.url));
                response.cookies.set('auth_token', '', { path: '/', maxAge: 0 });
                return response;
            }

            const response = NextResponse.next();
            response.cookies.set('auth_token', '', { path: '/', maxAge: 0 });
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

export default proxy;

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - img (public images)
         */
        '/((?!_next/static|_next/image|favicon.ico|img).*)',
    ],
};
