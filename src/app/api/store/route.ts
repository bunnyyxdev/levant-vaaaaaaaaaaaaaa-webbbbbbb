import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import StoreItem from '@/models/StoreItem';
import Purchase from '@/models/Purchase';
import Pilot from '@/models/Pilot';

// GET - List active store items and current pilot balance
export async function GET() {
    try {
        const session = await verifyAuth();
        await connectDB();
        
        const items = await StoreItem.find({ active: true }).sort({ created_at: -1 });
        const pilot = await Pilot.findById(session.id).select('total_credits');
        
        // Get pilot's purchase history to show what they already own (if useful)
        const purchases = await Purchase.find({ pilot_id: session.id });

        return NextResponse.json({
            items,
            balance: pilot?.total_credits || 0,
            ownedItems: purchases.map(p => p.item_id.toString())
        });
    } catch (error: any) {
        console.error('Store fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Purchase an item
export async function POST(request: NextRequest) {
    try {
        const session = await verifyAuth();
        await connectDB();
        
        const { itemId } = await request.json();

        const item = await StoreItem.findById(itemId);
        if (!item || !item.active) {
            return NextResponse.json({ error: 'Item not found or inactive' }, { status: 404 });
        }

        const pilot = await Pilot.findById(session.id);
        if (!pilot) {
            return NextResponse.json({ error: 'Pilot not found' }, { status: 404 });
        }

        if (pilot.total_credits < item.price) {
            return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
        }

        // Check if already purchased (optional: depends on item category)
        // For Badges/Aircraft, maybe one-time only. For perks, maybe multiple.
        if (item.category === 'Badge' || item.category === 'Aircraft') {
            const existing = await Purchase.findOne({ pilot_id: session.id, item_id: itemId });
            if (existing) {
                return NextResponse.json({ error: 'You already own this item' }, { status: 400 });
            }
        }

        // Deduct credits and record purchase
        pilot.total_credits -= item.price;
        await pilot.save();

        await Purchase.create({
            pilot_id: session.id,
            item_id: itemId,
            price_paid: item.price
        });

        return NextResponse.json({
            success: true,
            newBalance: pilot.total_credits,
            message: `Successfully purchased ${item.name}`
        });
    } catch (error: any) {
        console.error('Purchase error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
