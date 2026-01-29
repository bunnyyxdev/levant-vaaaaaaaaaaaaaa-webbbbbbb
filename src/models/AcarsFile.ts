import mongoose from 'mongoose';

const AcarsFileSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['exe', 'zip'], // exe for installer, zip for plugin
    },
    version: {
        type: String,
        required: true,
    },
    fileName: {
        type: String,
        required: true,
    },
    filePath: {
        type: String,
        required: true,
    },
    size: {
        type: String,
    },
    notes: {
        type: String,
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pilot',
    }
});

export default mongoose.models.AcarsFile || mongoose.model('AcarsFile', AcarsFileSchema);
