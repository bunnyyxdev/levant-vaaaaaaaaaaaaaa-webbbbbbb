import mongoose, { Schema, Document, Model } from 'mongoose';

// Pilot's tour progress
export interface ITourProgress extends Document {
    pilot_id: mongoose.Types.ObjectId;
    tour_id: mongoose.Types.ObjectId;
    current_leg: number;
    legs_completed: {
        leg_number: number;
        flight_id?: mongoose.Types.ObjectId;
        completed_at: Date;
    }[];
    status: 'in_progress' | 'completed' | 'abandoned';
    started_at: Date;
    completed_at?: Date;
}

const TourProgressSchema = new Schema<ITourProgress>({
    pilot_id: { type: Schema.Types.ObjectId, ref: 'Pilot', required: true },
    tour_id: { type: Schema.Types.ObjectId, ref: 'Tour', required: true },
    current_leg: { type: Number, default: 1 },
    legs_completed: [{
        leg_number: { type: Number, required: true },
        flight_id: { type: Schema.Types.ObjectId, ref: 'Flight' },
        completed_at: { type: Date, default: Date.now },
    }],
    status: { type: String, enum: ['in_progress', 'completed', 'abandoned'], default: 'in_progress' },
    started_at: { type: Date, default: Date.now },
    completed_at: { type: Date },
});

// Compound index for unique tour per pilot
TourProgressSchema.index({ pilot_id: 1, tour_id: 1 }, { unique: true });

const TourProgress: Model<ITourProgress> = mongoose.models.TourProgress || mongoose.model<ITourProgress>('TourProgress', TourProgressSchema);

export default TourProgress;
