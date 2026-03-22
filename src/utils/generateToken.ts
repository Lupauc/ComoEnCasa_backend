import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';

interface JWTPayloadUser {
    _id: unknown;
    role: string;
}

export const generateJWT = (user: JWTPayloadUser): string => {
    return jwt.sign(
        { id: user._id, role: user.role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
    );
};

export const generateRandomToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

export const generateOrderNumber = async (): Promise<string> => {
    const Order = (await import('../models/Order')).default;
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');

    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const count = await Order.countDocuments({ createdAt: { $gte: startOfDay } });

    const sequence = String(count + 1).padStart(4, '0');
    return `ORD-${datePart}-${sequence}`;
};