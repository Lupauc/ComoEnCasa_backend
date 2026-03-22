import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import User from '../models/User';

interface JWTPayload {
    id: string;
    role: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'No token provided. Please log in.' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
        const user = await User.findById(decoded.id);

        if (!user) {
            res.status(401).json({ success: false, message: 'User no longer exists.' });
            return;
        }

        req.user = user;
        next();
    } catch {
        res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
            const user = await User.findById(decoded.id);
            if (user) req.user = user;
        }
    } catch {
        // token inválido o ausente — continuar sin usuario
    }
    next();
};