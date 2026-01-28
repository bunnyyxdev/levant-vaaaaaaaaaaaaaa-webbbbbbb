import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStoreItem extends Document {
    name: string;
    description: string;
    price: number;
    category: 'Aircraft' | 'Badge' | 'Perk' | 'Other';
    image?: string;
    download_url?: string;
    active: boolean;
    created_at: Date;
}

const StoreItemSchema = new Schema<IStoreItem>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, enum: ['Aircraft', 'Badge', 'Perk', 'Other'], default: 'Other' },
    image: { type: String },
    download_url: { type: String },
    active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
});

const StoreItem: Model<IStoreItem> = mongoose.models.StoreItem || mongoose.model<IStoreItem>('StoreItem', StoreItemSchema);

export default StoreItem;
