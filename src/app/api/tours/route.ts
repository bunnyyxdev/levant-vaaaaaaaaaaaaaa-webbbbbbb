import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Tour from '@/models/Tour';
import TourProgress from '@/models/TourProgress';
import Pilot from '@/models/Pilot';

// GET - Fetch all active tours with user progress
export async function GET() {
    try {
        const session = await verifyAuth();
        await connectDB();
        
        const tours = await Tour.find({ active: true }).sort({ created_at: -1 });
        
        // Get user's progress for each tour
        const progress = await TourProgress.find({ pilot_id: session.id });
        const progressMap = new Map(progress.map(p => [p.tour_id.toString(), p]));
        
        const toursWithProgress = tours.map(tour => ({
            ...tour.toObject(),
            progress: progressMap.get(tour._id.toString()) || null,
        }));

        return NextResponse.json({ tours: toursWithProgress });
    } catch (error: any) {
        console.error('Fetch tours error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Start a tour
export async function POST(request: NextRequest) {
    try {
        const session = await verifyAuth();
        await connectDB();
        
        const { tourId } = await request.json();

        // Check if already started
        const existing = await TourProgress.findOne({ pilot_id: session.id, tour_id: tourId });
        if (existing) {
            return NextResponse.json({ error: 'Tour already started', progress: existing }, { status: 400 });
        }

        const progress = await TourProgress.create({
            pilot_id: session.id,
            tour_id: tourId,
        });

        return NextResponse.json({ success: true, progress });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT - Complete a leg
export async function PUT(request: NextRequest) {
    try {
        const session = await verifyAuth();
        await connectDB();
        
        const { tourId, legNumber, flightId } = await request.json();

        const progress = await TourProgress.findOne({ pilot_id: session.id, tour_id: tourId });
        if (!progress) {
            return NextResponse.json({ error: 'Tour not started' }, { status: 400 });
        }

        // Check if this is the next leg
        if (legNumber !== progress.current_leg) {
            return NextResponse.json({ error: 'Must complete legs in order' }, { status: 400 });
        }

        // Add completed leg
        progress.legs_completed.push({
            leg_number: legNumber,
            flight_id: flightId,
            completed_at: new Date(),
        });
        progress.current_leg = legNumber + 1;

        // Check if tour is complete
        const tour = await Tour.findById(tourId);
        let completed = false;
        if (tour && progress.legs_completed.length >= tour.legs.length) {
            progress.status = 'completed';
            progress.completed_at = new Date();
            completed = true;

            // Award points for tour completion
            if (tour.reward_credits > 0) {
                await Pilot.findByIdAndUpdate(session.id, {
                    $inc: { total_credits: tour.reward_credits }
                });
            }
        }

        await progress.save();

        return NextResponse.json({ 
            success: true, 
            progress, 
            completed,
            message: completed && tour?.reward_credits ? `Tour completed! You earned ${tour.reward_credits.toLocaleString()} points.` : undefined
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
