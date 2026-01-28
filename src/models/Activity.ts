import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// Activity Leg definition (individual leg within an activity)
export interface IActivityLeg {
    _id?: Types.ObjectId;
    leg_number: number;
    departure_icao?: string; // Optional = "Any"
    arrival_icao?: string;   // Optional = "Any"
    flight_number?: string;  // Optional = "Any"
    aircraft?: string;       // Optional = "Any"
    distance_nm?: number;
}

// Activity definition (Tour or Event with multiple legs)
export interface IActivity extends Document {
    title: string;
    description: string; // Can be EditorJS JSON or plain text
    banner?: string;
    type: 'Event' | 'Tour';
    startDate: Date;
    endDate?: Date;
    legsInOrder: boolean; // Must complete legs in order?
    minRank?: string;     // Minimum rank required
    reward?: {
        badge?: {
            name: string;
            image?: string;
        };
        points: number;    // Points awarded on completion
    };
    bonusXp: number;
    activityLegs: IActivityLeg[];
    
    // Statistics (computed/cached)
    averageDaysToComplete?: number;
    firstPilotToComplete?: string;
    totalPilotsComplete?: number;
    
    active: boolean;
    created_at: Date;
}

const ActivityLegSchema = new Schema<IActivityLeg>({
    leg_number: { type: Number, required: true },
    departure_icao: { type: String },
    arrival_icao: { type: String },
    flight_number: { type: String },
    aircraft: { type: String },
    distance_nm: { type: Number },
});

const ActivitySchema = new Schema<IActivity>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    banner: { type: String },
    type: { type: String, enum: ['Event', 'Tour'], default: 'Event' },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    legsInOrder: { type: Boolean, default: false },
    minRank: { type: String },
    reward: {
        badge: {
            name: { type: String },
            image: { type: String },
        },
        points: { type: Number, default: 0 },
    },
    bonusXp: { type: Number, default: 0 },
    activityLegs: [ActivityLegSchema],
    averageDaysToComplete: { type: Number },
    firstPilotToComplete: { type: String },
    totalPilotsComplete: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
});

const Activity: Model<IActivity> = mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);

export default Activity;
