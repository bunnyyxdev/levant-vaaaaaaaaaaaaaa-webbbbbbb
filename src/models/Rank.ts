import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRank extends Document {
    name: string;
    description?: string;
    requirement_hours: number;
    requirement_flights: number;
    auto_promote: boolean; // If false, pilot must be promoted manually by admin
    allowed_aircraft: string[]; // List of ICAO codes
    image_url?: string;
    order: number; // For sorting ranks (0, 1, 2...)
}

const RankSchema = new Schema<IRank>({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    requirement_hours: { type: Number, default: 0 },
    requirement_flights: { type: Number, default: 0 },
    auto_promote: { type: Boolean, default: true },
    allowed_aircraft: [{ type: String }],
    image_url: { type: String },
    order: { type: Number, default: 0 },
});

const Rank: Model<IRank> = mongoose.models.Rank || mongoose.model<IRank>('Rank', RankSchema);

export default Rank;
