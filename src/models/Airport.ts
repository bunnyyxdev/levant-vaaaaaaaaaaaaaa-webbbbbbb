import mongoose, { Schema, Document, Model } from 'mongoose';

// Runway subdocument
export interface IRunway {
    name: string;
    length: number;      // feet
    width: number;       // feet
    surface: string;
    heading: number;
    elevation?: number;  // feet
}

// Frequency subdocument
export interface IFrequency {
    type: string;        // TWR, GND, APP, DEP, ATIS etc.
    frequency: number;   // MHz
}

// Navaid subdocument
export interface INavaid {
    type: string;        // VOR, NDB, ILS
    ident: string;
    frequency: number;   // kHz
}

// Airport document
export interface IAirport extends Document {
    icao: string;
    iata?: string;
    name: string;
    city?: string;
    country?: string;
    lat: number;
    lng: number;
    altitude: number;    // feet
    runways: IRunway[];
    frequencies: IFrequency[];
    navaids: INavaid[];
}

const RunwaySchema = new Schema<IRunway>({
    name: { type: String, required: true },
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    surface: { type: String },
    heading: { type: Number },
    elevation: { type: Number },
});

const FrequencySchema = new Schema<IFrequency>({
    type: { type: String, required: true },
    frequency: { type: Number, required: true },
});

const NavaidSchema = new Schema<INavaid>({
    type: { type: String, required: true },
    ident: { type: String, required: true },
    frequency: { type: Number, required: true },
});

const AirportSchema = new Schema<IAirport>({
    icao: { type: String, required: true, unique: true, uppercase: true },
    iata: { type: String, uppercase: true },
    name: { type: String, required: true },
    city: { type: String },
    country: { type: String },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    altitude: { type: Number, default: 0 },
    runways: [RunwaySchema],
    frequencies: [FrequencySchema],
    navaids: [NavaidSchema],
});

// Index for fast ICAO lookups (Already handled by unique: true)
// AirportSchema.index({ icao: 1 });

const Airport: Model<IAirport> = mongoose.models.Airport || mongoose.model<IAirport>('Airport', AirportSchema);

export default Airport;
