import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { jwtSecret } from './config/config';

export async function middleware(request: NextRequest) {
    const { pathname, hostname } = request.nextUrl;
    const rawToken = request.cookies.get('auth_token')?.value;
    const token = rawToken?.trim();
    
    console.log(`Middleware: Processing ${pathname} on ${hostname}`);
    console.log(`Middleware: Token present: ${!!token}, Token length: ${token?.length || 0}`);
    console.log(`Middleware: Secret length: ${jwtSecret?.length || 0}`);

    // 2. Skip checks for static assets and public APIs
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') || 
        pathname.startsWith('/img') ||
        pathname === '/blacklist'
    ) {
        return NextResponse.next();
    }

    if (token) {
        if (pathname === '/login') {
            console.log('Middleware: Path is /login, redirecting to dashboard');
            return NextResponse.redirect(new URL('/portal/dashboard', request.url));
        }
        try {
            const secret = new TextEncoder().encode(jwtSecret);
            const { payload } = await jwtVerify(token, secret);
            console.log('Middleware: Token verified successfully. Email:', payload.email);

            // Check if user is blacklisted
            if (payload.status === 'Blacklist') {
                console.log('Middleware: User blacklisted, rewriting to 404');
                return NextResponse.rewrite(new URL('/404', request.url));
            }

        } catch (error: any) {
            console.error('Middleware: Verification FAILED:', error.code || error.message);
            // Token invalid - clear it and redirect to home if on protected route
            if (pathname.startsWith('/portal')) {
                console.log('Middleware: Access to protected route denied. Redirecting Home.');
                const response = NextResponse.redirect(new URL('/', request.url));
                response.cookies.set('auth_token', '', { path: '/', maxAge: 0 }); // Explicit clear
                return response;
            }
            return NextResponse.next();
        }
    } else {
        // Protected routes check
        if (pathname.startsWith('/portal')) {
            console.log('Middleware: No token found for portal route. Redirecting Home.');
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
