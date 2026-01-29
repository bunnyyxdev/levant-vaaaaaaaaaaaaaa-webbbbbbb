import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// Pilot Award - tracks which awards a pilot has earned
export interface IPilotAward extends Document {
    pilot_id: Types.ObjectId;
    award_id: Types.ObjectId;
    earned_at: Date;
    activity_id?: Types.ObjectId; // If earned from completing an activity
}

const PilotAwardSchema = new Schema<IPilotAward>({
    pilot_id: { type: Schema.Types.ObjectId, ref: 'Pilot', required: true },
    award_id: { type: Schema.Types.ObjectId, ref: 'Award', required: true },
    earned_at: { type: Date, default: Date.now },
    activity_id: { type: Schema.Types.ObjectId, ref: 'Activity' },
});

// Unique constraint - pilot can only earn each award once
PilotAwardSchema.index({ pilot_id: 1, award_id: 1 }, { unique: true });

const PilotAward: Model<IPilotAward> = mongoose.models.PilotAward || mongoose.model<IPilotAward>('PilotAward', PilotAwardSchema);

export default PilotAward;
