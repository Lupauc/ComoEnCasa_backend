import { Request, Response, NextFunction } from 'express';
import Contact from '../models/Contact';
import { createError } from '../middlewares/errorHandler';

// POST /api/contact  — público
export const createContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, email, phone, subject, message, acceptedPrivacy } = req.body;

        if (!acceptedPrivacy) {
            return next(createError('Debes aceptar la política de privacidad para enviar el formulario.', 400));
        }

        const contact = await Contact.create({
            name,
            email,
            phone,
            subject,
            message,
            acceptedPrivacy: true,
            acceptedPrivacyAt: new Date(),
        });
        res.status(201).json({
            success: true,
            message: '¡Mensaje enviado! Nos pondremos en contacto contigo pronto.',
            data: { id: contact._id },
        });
    } catch (error) { next(error); }
};

// GET /api/contact  [ADMIN]
export const getContacts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const unreadOnly = req.query.unread === 'true';

        const filter = unreadOnly ? { isRead: false } : {};

        const [contacts, total] = await Promise.all([
            Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Contact.countDocuments(filter),
        ]);

        res.json({ success: true, data: { contacts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
    } catch (error) { next(error); }
};

// PUT /api/contact/:id/read  [ADMIN]
export const markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const contact = await Contact.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
        if (!contact) return next(createError('Mensaje no encontrado.', 404));
        res.json({ success: true, data: { contact } });
    } catch (error) { next(error); }
};

// DELETE /api/contact/:id  [ADMIN]
export const deleteContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        if (!contact) return next(createError('Mensaje no encontrado.', 404));
        res.json({ success: true, message: 'Mensaje eliminado.' });
    } catch (error) { next(error); }
};
