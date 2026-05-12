import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service';
import { createError } from '../middlewares/errorHandler';

// GET /api/users/profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
    res.json({ success: true, data: { user: req.user } });
};

// PUT /api/users/profile
export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, phone } = req.body;

        const updateData: Record<string, unknown> = {};
        if (name !== undefined && name !== '') updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;

        const user = await User.findByIdAndUpdate(
            req.user!._id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!user) return next(createError('Usuario no encontrado.', 404));

        res.json({ success: true, message: 'Perfil actualizado.', data: { user } });
    } catch (error) {
        next(error);
    }
};

// PUT /api/users/profile/avatar
export const updateAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.file) {
            return next(createError('No se ha proporcionado ninguna imagen.', 400));
        }

        const user = req.user!;

        if (user.avatarPublicId) {
            await deleteFromCloudinary(user.avatarPublicId);
        }

        const result = await uploadToCloudinary(req.file.buffer, 'comoencasa/avatars');

        const updated = await User.findByIdAndUpdate(
            user._id,
            { $set: { avatar: result.secure_url, avatarPublicId: result.public_id } },
            { new: true }
        );

        res.json({ success: true, message: 'Avatar actualizado.', data: { avatar: result.secure_url, user: updated } });
    } catch (error) {
        next(error);
    }
};

// PUT /api/users/change-password
export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user!._id).select('+password');

        if (!user || !user.password) {
            return next(createError('El cambio de contraseña no está disponible para cuentas con acceso OAuth.', 400));
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return next(createError('La contraseña actual es incorrecta.', 401));
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Contraseña cambiada correctamente.' });
    } catch (error) {
        next(error);
    }
};

// GET /api/users  [ADMIN]
export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            User.countDocuments(),
        ]);

        res.json({
            success: true,
            data: {
                users,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            },
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/users/:id  [ADMIN]
export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return next(createError('Usuario no encontrado.', 404));
        res.json({ success: true, data: { user } });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/users/:id  [ADMIN]
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return next(createError('Usuario no encontrado.', 404));

        if (user._id.toString() === req.user!._id.toString()) {
            return next(createError('No puedes eliminar tu propia cuenta.', 400));
        }

        if (user.avatarPublicId) {
            await deleteFromCloudinary(user.avatarPublicId);
        }

        await user.deleteOne();

        res.json({ success: true, message: 'Usuario eliminado correctamente.' });
    } catch (error) {
        next(error);
    }
};
