import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { IProduct } from './Product';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface IOrderItem {
    product: mongoose.Types.ObjectId | IProduct;
    name: string; price: number; quantity: number; subtotal: number;
}
export interface IStatusHistory {
    status: OrderStatus; changedAt: Date; changedBy: mongoose.Types.ObjectId | IUser;
}
export interface IOrder extends Document {
    orderNumber: string;
    user: mongoose.Types.ObjectId | IUser;
    items: IOrderItem[];
    total: number;
    status: OrderStatus;
    pickupDate: Date;
    pickupTime: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    notes: string;
    cancelReason: string;
    statusHistory: IStatusHistory[];
    createdAt: Date;
    updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
    {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true }, price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 }, subtotal: { type: Number, required: true, min: 0 }
    },
    { _id: false }
);

const StatusHistorySchema = new Schema<IStatusHistory>(
    {
        status: { type: String, enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'], required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User' }
    },
    { _id: false }
);

const OrderSchema = new Schema<IOrder>(
    {
        orderNumber: { type: String, required: true, unique: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        items: { type: [OrderItemSchema], required: true },
        total: { type: Number, required: true, min: 0 },
        status: { type: String, enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'], default: 'pending' },
        pickupDate: { type: Date },
        pickupTime: { type: String, default: '' },
        customerName: { type: String, required: true },
        customerEmail: { type: String, required: true },
        customerPhone: { type: String, default: '' },
        notes: { type: String, default: '' },
        cancelReason: { type: String, default: '' },
        statusHistory: { type: [StatusHistorySchema], default: [] }
    },
    { timestamps: true }
);

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IOrder>('Order', OrderSchema);