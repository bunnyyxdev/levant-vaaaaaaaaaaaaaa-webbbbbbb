import mongoose, { Schema, Document } from 'mongoose';

export interface IDestinationOfTheMonth extends Document {
    icao: string;
    bonus_points: number;
    description?: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

const DotmSchema: Schema = new Schema({
    icao: { type: String, required: true, uppercase: true },
    bonus_points: { type: Number, required: true, default: 1000 },
    description: { type: String },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// Ensure only one DOTM is active at a time? 
// For now, we'll just fetch the latest active one.

export default mongoose.models.DestinationOfTheMonth || mongoose.model<IDestinationOfTheMonth>('DestinationOfTheMonth', DotmSchema);
