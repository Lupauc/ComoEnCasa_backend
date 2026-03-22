import mongoose, { Document, Schema } from 'mongoose';
import { ICategory } from './Category';

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    category: mongoose.Types.ObjectId | ICategory;
    image: string;
    imagePublicId: string;
    ingredients: string[];
    allergens: string[];
    isAvailable: boolean;
    isFeatured: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            maxlength: [150, 'Name cannot exceed 150 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
            default: '',
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Category is required'],
        },
        image: {
            type: String,
            default: '',
        },
        imagePublicId: {
            type: String,
            default: '',
        },
        ingredients: {
            type: [String],
            default: [],
        },
        allergens: {
            type: [String],
            default: [],
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

ProductSchema.index({ category: 1, order: 1 });
ProductSchema.index({ isAvailable: 1 });
ProductSchema.index({ isFeatured: 1 });

export default mongoose.model<IProduct>('Product', ProductSchema);