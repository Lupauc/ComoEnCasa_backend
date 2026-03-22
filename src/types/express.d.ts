import { Document } from 'mongoose';

declare global {
    namespace Express {
        interface User {
            _id: Document['_id'];
            name: string;
            email: string;
            password?: string;
            googleId?: string;
            avatar?: string;
            avatarPublicId?: string;
            phone?: string;
            role: 'customer' | 'admin';
            isEmailVerified: boolean;
            emailVerificationToken?: string;
            emailVerificationExpires?: Date;
            passwordResetToken?: string;
            passwordResetExpires?: Date;
            createdAt: Date;
            updatedAt: Date;
            comparePassword(candidatePassword: string): Promise<boolean>;
            save(): Promise<Express.User>;
            deleteOne(): Promise<Express.User>;
        }

        interface Request {
            user?: User;
        }
    }
}

export { };