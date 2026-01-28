import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPasswordReset extends Document {
    email: string;
    token: string;
    expires_at: Date;
    created_at: Date;
}

const PasswordResetSchema = new Schema<IPasswordReset>({
    email: { type: String, required: true, lowercase: true },
    token: { type: String, required: true, unique: true },
    expires_at: { type: Date, required: true },
    created_at: { type: Date, default: Date.now },
});

// Auto-expire after 1 hour
PasswordResetSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

const PasswordReset: Model<IPasswordReset> = mongoose.models.PasswordReset || mongoose.model<IPasswordReset>('PasswordReset', PasswordResetSchema);

export default PasswordReset;
