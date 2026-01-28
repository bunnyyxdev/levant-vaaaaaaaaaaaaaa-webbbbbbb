import mongoose, { Schema, Document, Model } from 'mongoose';

// Tour definition (a multi-leg journey)
export interface ITour extends Document {
    name: string;
    description: string;
    image?: string;
    legs: {
        leg_number: number;
        departure_icao: string;
        arrival_icao: string;
        aircraft_types?: string[];
        distance_nm?: number;
    }[];
    total_distance: number;
    reward_credits: number;
    reward_badge?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    active: boolean;
    created_at: Date;
}

const TourSchema = new Schema<ITour>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    legs: [{
        leg_number: { type: Number, required: true },
        departure_icao: { type: String, required: true },
        arrival_icao: { type: String, required: true },
        aircraft_types: [{ type: String }],
        distance_nm: { type: Number },
    }],
    total_distance: { type: Number, default: 0 },
    reward_credits: { type: Number, default: 0 },
    reward_badge: { type: String },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
});

const Tour: Model<ITour> = mongoose.models.Tour || mongoose.model<ITour>('Tour', TourSchema);

export default Tour;
