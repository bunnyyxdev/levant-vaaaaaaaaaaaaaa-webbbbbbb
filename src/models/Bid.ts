import mongoose, { Schema, Document } from 'mongoose';

export interface IBid extends Document {
    pilot_id: mongoose.Types.ObjectId;
    pilot_name: string;
    callsign: string;
    departure_icao: string;
    arrival_icao: string;
    aircraft_type: string;
    status: 'Active' | 'Completed' | 'Cancelled';
    created_at: Date;
    expires_at: Date;
}

const BidSchema = new Schema<IBid>({
    pilot_id: { type: Schema.Types.ObjectId, ref: 'Pilot', required: true },
    pilot_name: { type: String, required: true },
    callsign: { type: String, required: true },
    departure_icao: { type: String, required: true },
    arrival_icao: { type: String, required: true },
    aircraft_type: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Completed', 'Cancelled'], default: 'Active' },
    created_at: { type: Date, default: Date.now },
    expires_at: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }, // 24 hours
});

// Auto-expire index
BidSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Bid || mongoose.model<IBid>('Bid', BidSchema);
