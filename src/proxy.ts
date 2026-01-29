import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { jwtSecret } from './config/config';

export async function proxy(request: NextRequest) {
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
        try {
            const secret = new TextEncoder().encode(jwtSecret);
            const { payload } = await jwtVerify(token, secret);
            console.log(`Middleware: Token verified. Email: ${payload.email}, Role: ${payload.role}, isAdmin: ${payload.isAdmin}`);

            // Check if user is blacklisted
            if (payload.status === 'Blacklist') {
                console.log('Middleware: User blacklisted, rewriting to 404');
                return NextResponse.rewrite(new URL('/404', request.url));
            }

            // If we are at /login but have a valid token, go to portal
            if (pathname === '/login') {
                console.log('Middleware: Path is /login, redirecting to dashboard');
                return NextResponse.redirect(new URL('/portal/dashboard', request.url));
            }

        } catch (error: any) {
            const errorMsg = error.code || error.message;
            console.error('Middleware: Verification FAILED:', errorMsg);
            
            if (pathname.startsWith('/portal')) {
                console.log('Middleware: Access to protected route denied. Redirecting to Login.');
                const response = NextResponse.redirect(new URL('/login', request.url));
                response.cookies.set('auth_token', '', { path: '/', maxAge: 0 });
                return response;
            }
        }
    } else {
        // Protected routes check
        if (pathname.startsWith('/portal')) {
            console.log('Middleware: No token found for portal route. Redirecting to Login.');
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
