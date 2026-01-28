import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFlight extends Document {
    pilot_id: mongoose.Types.ObjectId;
    pilot_name: string;
    flight_number: string;
    callsign: string;
    departure_icao: string;
    arrival_icao: string;
    alternate_icao?: string;
    route?: string;
    aircraft_type: string;
    flight_time: number; // in minutes
    fuel_used: number;
    distance: number;
    landing_rate: number;
    pax?: number;
    cargo?: number;
    score?: number;
    approved_status: number; // 0=Pending, 1=Approved, 2=Rejected
    comments?: string;
    admin_comments?: string;
    submitted_at: Date;
    reviewed_at?: Date;
    reviewed_by?: mongoose.Types.ObjectId;
}

const FlightSchema = new Schema<IFlight>({
    pilot_id: { type: Schema.Types.ObjectId, ref: 'Pilot', required: true },
    pilot_name: { type: String, required: true },
    flight_number: { type: String, required: true },
    callsign: { type: String, required: true },
    departure_icao: { type: String, required: true },
    arrival_icao: { type: String, required: true },
    alternate_icao: { type: String },
    route: { type: String },
    aircraft_type: { type: String, required: true },
    flight_time: { type: Number, required: true },
    fuel_used: { type: Number, default: 0 },
    distance: { type: Number, default: 0 },
    landing_rate: { type: Number, required: true },
    pax: { type: Number, default: 0 },
    cargo: { type: Number, default: 0 },
    score: { type: Number, default: 100 },
    approved_status: { type: Number, default: 0 }, // 0=Pending, 1=Approved, 2=Rejected
    comments: { type: String },
    admin_comments: { type: String },
    submitted_at: { type: Date, default: Date.now },
    reviewed_at: { type: Date },
    reviewed_by: { type: Schema.Types.ObjectId, ref: 'Pilot' },
});

// Indexes for faster searching
FlightSchema.index({ pilot_id: 1 });
FlightSchema.index({ approved_status: 1 });
FlightSchema.index({ flight_number: 1 });

const Flight: Model<IFlight> = mongoose.models.Flight || mongoose.model<IFlight>('Flight', FlightSchema);

export default Flight;
