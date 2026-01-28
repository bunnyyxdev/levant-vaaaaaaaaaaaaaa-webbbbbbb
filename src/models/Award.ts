import mongoose, { Schema, Document, Model } from 'mongoose';

// Award definition (badges pilots can earn)
export interface IAward extends Document {
    name: string;
    description?: string;
    imageUrl?: string;        // Image file in /img/badge/ or /img/award/
    category?: 'Flight Hours' | 'Landings' | 'Flights' | 'Tours' | 'Special';
    criteria?: string;        // Human-readable criteria for earning
    requiredValue?: number;   // Numeric threshold (e.g., 100 hours)
    active: boolean;
    order?: number;           // Display order
    created_at: Date;
}

const AwardSchema = new Schema<IAward>({
    name: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    category: { type: String },
    criteria: { type: String },
    requiredValue: { type: Number },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
});

AwardSchema.index({ active: 1, order: 1 });

const Award: Model<IAward> = mongoose.models.Award || mongoose.model<IAward>('Award', AwardSchema);

export default Award;
