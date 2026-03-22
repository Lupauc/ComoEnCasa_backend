// src/models/RestaurantInfo.ts  (ACTUALIZADO — añade galería)
import mongoose, { Document, Schema } from 'mongoose';

export interface IScheduleEntry { days: string; openTime: string; closeTime: string; }

export interface IRestaurantInfo extends Document {
    name: string; address: string; phone: string; email: string;
    instagram: string; whatsapp: string;
    schedule: IScheduleEntry[];
    location: { lat: number; lng: number };
    gallery: { url: string; publicId: string; caption?: string }[];
    updatedAt: Date;
}

const ScheduleSchema = new Schema<IScheduleEntry>(
    { days: { type: String, required: true }, openTime: { type: String, required: true }, closeTime: { type: String, required: true } },
    { _id: false }
);

const RestaurantInfoSchema = new Schema<IRestaurantInfo>(
    {
        name: { type: String, default: 'ComoEnCasa Rivas' },
        address: { type: String, default: 'Pza. de la Constitución, 2 - Planta Alta Local A38, Rivas-Vaciamadrid' },
        phone: { type: String, default: '610 905 086' },
        email: { type: String, default: '' },
        instagram: { type: String, default: '@comoencasarivas' },
        whatsapp: { type: String, default: '610905086' },
        schedule: {
            type: [ScheduleSchema],
            default: [
                { days: 'Lunes a Domingo', openTime: '09:00', closeTime: '16:30' },
                { days: 'Lunes a Domingo', openTime: '19:30', closeTime: '23:30' },
            ],
        },
        location: {
            lat: { type: Number, default: 40.3523 },
            lng: { type: Number, default: -3.5224 },
        },
        // ✅ NUEVO: galería de fotos del local
        gallery: {
            type: [{
                url: { type: String, required: true },
                publicId: { type: String, required: true },
                caption: { type: String, default: '' },
            }],
            default: [],
        },
    },
    { timestamps: true }
);

export default mongoose.model<IRestaurantInfo>('RestaurantInfo', RestaurantInfoSchema);
