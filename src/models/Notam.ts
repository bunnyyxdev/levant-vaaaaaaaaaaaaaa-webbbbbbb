import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotam extends Document {
    title: string;
    content: string;
    type: 'news' | 'notam' | 'event';
    priority: 'normal' | 'important' | 'urgent';
    author_id: mongoose.Types.ObjectId;
    author_name: string;
    event_date?: Date;
    event_location?: string;
    bonus_credits?: number;
    active: boolean;
    created_at: Date;
}

const NotamSchema = new Schema<INotam>({
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['news', 'notam', 'event'], default: 'news' },
    priority: { type: String, enum: ['normal', 'important', 'urgent'], default: 'normal' },
    author_id: { type: Schema.Types.ObjectId, ref: 'Pilot', required: true },
    author_name: { type: String, required: true },
    event_date: { type: Date },
    event_location: { type: String },
    bonus_credits: { type: Number },
    active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
});

const Notam: Model<INotam> = mongoose.models.Notam || mongoose.model<INotam>('Notam', NotamSchema);

export default Notam;
