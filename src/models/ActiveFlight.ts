import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActiveFlight extends Document {
    pilot_id: mongoose.Types.ObjectId;
    pilot_name: string;
    callsign: string;
    departure_icao: string;
    arrival_icao: string;
    aircraft_type: string;
    latitude: number;
    longitude: number;
    altitude: number;
    heading: number;
    ground_speed: number;
    status: string;
    takeoff_notified: boolean;
    started_at: Date;
    last_update: Date;
}

const ActiveFlightSchema = new Schema<IActiveFlight>({
    pilot_id: { type: Schema.Types.ObjectId, ref: 'Pilot', required: true },
    pilot_name: { type: String, required: true },
    callsign: { type: String, required: true },
    departure_icao: { type: String },
    arrival_icao: { type: String },
    aircraft_type: { type: String },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    altitude: { type: Number, default: 0 },
    heading: { type: Number, default: 0 },
    ground_speed: { type: Number, default: 0 },
    status: { type: String, default: 'Preflight' },
    takeoff_notified: { type: Boolean, default: false },
    started_at: { type: Date, default: Date.now },
    last_update: { type: Date, default: Date.now },
});

// Auto-expire documents after 10 minutes of no updates
ActiveFlightSchema.index({ last_update: 1 }, { expireAfterSeconds: 600 });

const ActiveFlight: Model<IActiveFlight> = mongoose.models.ActiveFlight || mongoose.model<IActiveFlight>('ActiveFlight', ActiveFlightSchema);

export default ActiveFlight;
