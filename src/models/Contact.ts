import mongoose, { Document, Schema } from 'mongoose';

export interface IContact extends Document {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    acceptedPrivacy: boolean;
    acceptedPrivacyAt: Date;
    isRead: boolean;
    createdAt: Date;
}

const ContactSchema = new Schema<IContact>(
    {
        name: { type: String, required: true, trim: true, maxlength: 100 },
        email: { type: String, required: true, lowercase: true, trim: true },
        phone: { type: String, trim: true, default: '' },
        subject: { type: String, required: true, trim: true, maxlength: 200 },
        message: { type: String, required: true, trim: true, maxlength: 2000 },
        acceptedPrivacy: { type: Boolean, required: true, default: false },
        acceptedPrivacyAt: { type: Date, required: true },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

ContactSchema.index({ createdAt: -1 });
ContactSchema.index({ isRead: 1 });

export default mongoose.model<IContact>('Contact', ContactSchema);
