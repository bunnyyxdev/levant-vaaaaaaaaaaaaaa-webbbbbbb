import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// Activity Interest - tracks pilots interested in attending an event
export interface IActivityInterest extends Document {
    pilot_id: Types.ObjectId;
    activity_id: Types.ObjectId;
    created_at: Date;
}

const ActivityInterestSchema = new Schema<IActivityInterest>({
    pilot_id: { type: Schema.Types.ObjectId, ref: 'Pilot', required: true },
    activity_id: { type: Schema.Types.ObjectId, ref: 'Activity', required: true },
    created_at: { type: Date, default: Date.now },
});

// Compound index for efficient lookups and uniqueness
ActivityInterestSchema.index({ pilot_id: 1, activity_id: 1 }, { unique: true });

const ActivityInterest: Model<IActivityInterest> = 
    mongoose.models.ActivityInterest || 
    mongoose.model<IActivityInterest>('ActivityInterest', ActivityInterestSchema);

export default ActivityInterest;
