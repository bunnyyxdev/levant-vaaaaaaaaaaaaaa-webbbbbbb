import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { jwtSecret } from '../config/config';

export interface AuthSession {
    id: string;
    pilotId: string;
    isAdmin: boolean;
    email: string;
}

/**
 * Verifies the authentication token from cookies and returns the session data.
 * Throws an error if the token is missing, invalid, or expired.
 */
export async function verifyAuth(): Promise<AuthSession> {
    const cookieStore = await cookies();
    const token = cookieStore.get('lva_session')?.value;

    if (!token) {
        throw new Error('Unauthorized: No token provided');
    }

    try {
        const secret = new TextEncoder().encode(jwtSecret);
        const { payload } = await jwtVerify(token, secret);

        return {
            id: payload.id as string,
            pilotId: payload.pilotId as string,
            isAdmin: payload.isAdmin as boolean,
            email: payload.email as string,
        };
    } catch (error) {
        throw new Error('Unauthorized: Invalid or expired token');
    }
}
