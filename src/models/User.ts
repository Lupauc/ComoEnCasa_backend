import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
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
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, 'El nombre es obligatorio'],
            trim: true,
            maxlength: [100, 'El nombre no puede superar los 100 caracteres'],
        },
        email: {
            type: String,
            required: [true, 'El correo electrónico es obligatorio'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Introduce un correo electrónico válido'],
        },
        password: {
            type: String,
            minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
            select: false,
        },
        googleId: {
            type: String,
            sparse: true,
        },
        avatar: {
            type: String,
            default: '',
        },
        avatarPublicId: {
            type: String,
            default: '',
        },
        phone: {
            type: String,
            trim: true,
            maxlength: [20, 'El teléfono no puede superar los 20 caracteres'],
        },
        role: {
            type: String,
            enum: ['customer', 'admin'],
            default: 'customer',
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: String,
        emailVerificationExpires: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
    },
    {
        timestamps: true,
    }
);
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};
UserSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.emailVerificationToken;
    delete obj.emailVerificationExpires;
    delete obj.passwordResetToken;
    delete obj.passwordResetExpires;
    return obj;
};

export default mongoose.model<IUser>('User', UserSchema);
