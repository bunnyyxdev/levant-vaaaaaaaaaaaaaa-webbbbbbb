import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Pilot from '@/models/Pilot';
import { sendAccountActivatedEmail, sendAccountInactiveEmail } from '@/lib/email';

// GET - List all users with roles and status
export async function GET() {
    try {
        const session = await verifyAuth();
        await connectDB();
        
        if (!session.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const users = await Pilot.find()
            .sort({ created_at: -1 })
            .select('-password');
        
        const formattedUsers = users.map(user => ({
            id: user._id.toString(),
            pilotId: user.pilot_id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            role: user.role,
            status: user.status,
            rank: user.rank,
            country: user.country,
            city: user.city,
            timezone: user.timezone,
            currentLocation: user.current_location,
            totalHours: user.total_hours || 0,
            totalFlights: user.total_flights || 0,
            totalCredits: user.total_credits || 0,
            createdAt: user.created_at,
            lastActivity: user.last_activity,
        }));

        return NextResponse.json({ users: formattedUsers });
    } catch (error: any) {
        console.error('Admin users GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT - Update a user (all fields except password)
export async function PUT(request: NextRequest) {
    try {
        const session = await verifyAuth();
        await connectDB();
        
        if (!session.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        console.log('Received user update request:', body); // Debugging
        const { userId, ...updates } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Fetch user for email notifications
        const user = await Pilot.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const previousStatus = user.status;
        const updateData: Record<string, any> = {};
        
        // Map camelCase to snake_case for database
        const fieldMapping: Record<string, string> = {
            pilotId: 'pilot_id',
            firstName: 'first_name',
            lastName: 'last_name',
            email: 'email',
            role: 'role',
            status: 'status',
            rank: 'rank',
            country: 'country',
            city: 'city',
            timezone: 'timezone',
            currentLocation: 'current_location',
            totalHours: 'total_hours',
            totalFlights: 'total_flights',
            totalCredits: 'total_credits',
        };

        // Build update object (exclude password)
        for (const [key, value] of Object.entries(updates)) {
            if (key === 'password') continue; // Never allow password update via this endpoint
            const dbField = fieldMapping[key];
            if (dbField && value !== undefined) {
                updateData[dbField] = value;
            }
        }

        // Special handling for role
        if (updates.role) {
            updateData.is_admin = updates.role === 'Admin';
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        await Pilot.findByIdAndUpdate(userId, updateData);

        // Send email notifications based on status change
        if (updates.status && updates.status !== previousStatus) {
            if (updates.status === 'Active' && (previousStatus === 'Pending' || previousStatus === 'Inactive')) {
                // Account activated
                await sendAccountActivatedEmail(user.email, user.pilot_id, user.first_name);
            } else if (updates.status === 'Inactive') {
                // Account marked inactive
                await sendAccountInactiveEmail(user.email, user.pilot_id, user.first_name);
            }
        }

        return NextResponse.json({ success: true, message: 'User updated successfully' });
    } catch (error: any) {
        console.error('Admin users PUT error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
