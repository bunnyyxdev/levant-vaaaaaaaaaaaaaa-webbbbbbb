import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAircraft extends Document {
    icao_code: string;
    name: string;
    manufacturer: string;
    category: string;
    is_active: boolean;
}

const AircraftSchema = new Schema<IAircraft>({
    icao_code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    category: { type: String, required: true },
    is_active: { type: Boolean, default: true },
});

const Aircraft: Model<IAircraft> = mongoose.models.Aircraft || mongoose.model<IAircraft>('Aircraft', AircraftSchema);

export default Aircraft;
