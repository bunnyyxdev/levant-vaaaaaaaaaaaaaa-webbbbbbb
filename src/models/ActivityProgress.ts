import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// Activity Progress - tracks a pilot's progress on an activity
export interface IActivityProgress extends Document {
    pilot_id: Types.ObjectId;
    activity_id: Types.ObjectId;
    
    // Progress tracking
    legsComplete: number;
    percentComplete: number;
    completedLegIds: Types.ObjectId[]; // Which legs have been completed
    
    // Dates
    startDate: Date;        // When pilot started this activity
    lastLegFlownDate?: Date;
    dateComplete?: Date;
    daysToComplete?: number; // Calculated on completion
    
    created_at: Date;
}

const ActivityProgressSchema = new Schema<IActivityProgress>({
    pilot_id: { type: Schema.Types.ObjectId, ref: 'Pilot', required: true },
    activity_id: { type: Schema.Types.ObjectId, ref: 'Activity', required: true },
    legsComplete: { type: Number, default: 0 },
    percentComplete: { type: Number, default: 0 },
    completedLegIds: [{ type: Schema.Types.ObjectId }],
    startDate: { type: Date, default: Date.now },
    lastLegFlownDate: { type: Date },
    dateComplete: { type: Date },
    daysToComplete: { type: Number },
    created_at: { type: Date, default: Date.now },
});

// Compound index for efficient lookups
ActivityProgressSchema.index({ pilot_id: 1, activity_id: 1 }, { unique: true });

const ActivityProgress: Model<IActivityProgress> = 
    mongoose.models.ActivityProgress || 
    mongoose.model<IActivityProgress>('ActivityProgress', ActivityProgressSchema);

export default ActivityProgress;
