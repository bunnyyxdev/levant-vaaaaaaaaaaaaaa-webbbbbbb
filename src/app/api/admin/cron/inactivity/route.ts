import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Pilot from '@/models/Pilot';
import { sendInactivityReminderEmail, sendAccountInactiveEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // 1. Mark as Inactive (> 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const inactivePilots = await Pilot.find({
            status: 'Active',
            last_activity: { $lt: thirtyDaysAgo }
        });

        for (const pilot of inactivePilots) {
            pilot.status = 'Inactive';
            await pilot.save();
            await sendAccountInactiveEmail(pilot.email, pilot.pilot_id, pilot.first_name);
            console.log(`Pilot ${pilot.pilot_id} marked as Inactive due to 30d inactivity.`);
        }

        // 2. Send Reminder (> 14 days)
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        // We find pilots between 14 and 30 days who are still Active
        const reminderPilots = await Pilot.find({
            status: 'Active',
            last_activity: { $lt: fourteenDaysAgo, $gt: thirtyDaysAgo }
        });

        for (const pilot of reminderPilots) {
            // In a real scenario, we might want to check if we already sent a reminder
            // but for this implementation we'll trigger the email
            await sendInactivityReminderEmail(pilot.email, pilot.pilot_id, pilot.first_name);
            console.log(`Sent inactivity reminder to pilot ${pilot.pilot_id} (14d+)`);
        }

        return NextResponse.json({
            success: true,
            processed: {
                marked_inactive: inactivePilots.length,
                reminders_sent: reminderPilots.length
            }
        });

    } catch (error: any) {
        console.error('Inactivity Cron Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
