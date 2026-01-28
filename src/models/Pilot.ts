import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPilot extends Document {
    pilot_id: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    phone_number?: string;
    rank: string;
    status: 'Active' | 'Inactive' | 'Blacklist' | 'Pending' | 'On leave (LOA)';
    role: 'Pilot' | 'Admin';
    is_admin: boolean;
    total_hours: number;
    total_flights: number;
    total_credits: number;
    landing_avg?: number;
    current_location: string;
    country: string;
    city?: string;
    timezone: string;
    desired_callsign?: string;
    simbrief_id?: string;
    last_activity?: Date;
    created_at: Date;
}

const PilotSchema = new Schema<IPilot>({
    pilot_id: { type: String, required: true, unique: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone_number: { type: String },
    rank: { type: String, default: 'Cadet' },
    status: { type: String, enum: ['Active', 'Inactive', 'Blacklist', 'Pending', 'On leave (LOA)'], default: 'Pending' },
    role: { type: String, enum: ['Pilot', 'Admin'], default: 'Pilot' },
    is_admin: { type: Boolean, default: false },
    total_hours: { type: Number, default: 0 },
    total_flights: { type: Number, default: 0 },
    total_credits: { type: Number, default: 0 },
    landing_avg: { type: Number },
    current_location: { type: String, default: 'OLBA' },
    country: { type: String, required: true },
    city: { type: String },
    timezone: { type: String, required: true },
    desired_callsign: { type: String },
    simbrief_id: { type: String },
    last_activity: { type: Date },
    created_at: { type: Date, default: Date.now },
});

// Prevent model recompilation in development
const Pilot: Model<IPilot> = mongoose.models.Pilot || mongoose.model<IPilot>('Pilot', PilotSchema);

export default Pilot;
