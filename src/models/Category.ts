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
            required: [true, 'El nombre de la categoría es obligatorio'],
            trim: true,
            maxlength: [80, 'El nombre no puede superar los 80 caracteres'],
        },
        slug: {
            type: String,
            required: [true, 'El slug es obligatorio'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[a-z0-9_-]+$/, 'El slug solo puede contener letras minúsculas, números, guiones y guiones bajos'],
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
