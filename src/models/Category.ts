import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    slug: string;
    emoji: string;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
    {
        name: {
            type: String,
            required: [true, 'Category name is required'],
            trim: true,
            maxlength: [80, 'Name cannot exceed 80 characters'],
        },
        slug: {
            type: String,
            required: [true, 'Slug is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[a-z0-9_-]+$/, 'Slug can only contain lowercase letters, numbers, hyphens and underscores'],
        },
        emoji: {
            type: String,
            default: '🍽️',
        },
        order: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

CategorySchema.index({ order: 1 });

export default mongoose.model<ICategory>('Category', CategorySchema);