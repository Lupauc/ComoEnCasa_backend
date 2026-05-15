import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const requireEnv = (key: string): string => {
    const value = process.env[key];
    if (!value) throw new Error(`Missing required environment variable: ${key}`);
    return value;
};

export const env = {
    PORT: parseInt(process.env.PORT || '5000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGODB_URI: requireEnv('MONGODB_URI'),
    JWT_SECRET: requireEnv('JWT_SECRET'),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    FRONTEND_URLS: process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:5173',
    BACKEND_URL: process.env.BACKEND_URL || '',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
    CLOUDINARY_CLOUD_NAME: requireEnv('CLOUDINARY_CLOUD_NAME'),
    CLOUDINARY_API_KEY: requireEnv('CLOUDINARY_API_KEY'),
    CLOUDINARY_API_SECRET: requireEnv('CLOUDINARY_API_SECRET'),
    RESEND_API_KEY: requireEnv('RESEND_API_KEY'),
    EMAIL_FROM: process.env.EMAIL_FROM || 'ComoEnCasa <noreply@comoencasarivas.com>',
};
