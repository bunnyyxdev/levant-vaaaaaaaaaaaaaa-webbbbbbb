import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuizAttempt extends Document {
    email: string;
    attempts: number;
    last_attempt_at: Date;
}

const QuizAttemptSchema = new Schema<IQuizAttempt>({
    email: { type: String, required: true, unique: true, lowercase: true },
    attempts: { type: Number, default: 0 },
    last_attempt_at: { type: Date, default: Date.now },
});

const QuizAttempt: Model<IQuizAttempt> = mongoose.models.QuizAttempt || mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);

export default QuizAttempt;
