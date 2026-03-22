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
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        password: {
            type: String,
            minlength: [8, 'Password must be at least 8 characters'],
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
            maxlength: [20, 'Phone cannot exceed 20 characters'],
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

// Encriptamos contraseña antes de guardar
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Comparamos contraseñas
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON output
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