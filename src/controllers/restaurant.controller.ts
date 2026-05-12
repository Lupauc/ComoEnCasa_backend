// src/controllers/restaurant.controller.ts  (ACTUALIZADO — galería)
import { Request, Response, NextFunction } from 'express';
import RestaurantInfo from '../models/RestaurantInfo';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service';
import { createError } from '../middlewares/errorHandler';

export const getRestaurantInfo = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        let info = await RestaurantInfo.findOne();
        if (!info) info = await RestaurantInfo.create({});
        res.json({ success: true, data: { restaurant: info } });
    } catch (error) { next(error); }
};

export const updateRestaurantInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, address, phone, email, instagram, whatsapp, schedule, location } = req.body;
        let info = await RestaurantInfo.findOne();
        if (!info) info = await RestaurantInfo.create({});

        if (name !== undefined) info.name = name;
        if (address !== undefined) info.address = address;
        if (phone !== undefined) info.phone = phone;
        if (email !== undefined) info.email = email;
        if (instagram !== undefined) info.instagram = instagram;
        if (whatsapp !== undefined) info.whatsapp = whatsapp;
        if (schedule !== undefined) info.schedule = schedule;
        if (location !== undefined) info.location = location;

        await info.save();
        res.json({ success: true, message: 'Información actualizada.', data: { restaurant: info } });
    } catch (error) { next(error); }
};

// POST /api/restaurant/gallery — sube una foto al local
export const addGalleryPhoto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.file) return next(createError('No se ha proporcionado ninguna imagen.', 400));
        const { caption } = req.body;

        let info = await RestaurantInfo.findOne();
        if (!info) info = await RestaurantInfo.create({});

        const result = await uploadToCloudinary(req.file.buffer, 'comoencasa/gallery');
        info.gallery.push({ url: result.secure_url, publicId: result.public_id, caption: caption || '' });
        await info.save();

        res.status(201).json({ success: true, message: 'Foto añadida.', data: { gallery: info.gallery } });
    } catch (error) { next(error); }
};

// DELETE /api/restaurant/gallery/:publicId — elimina una foto
export const deleteGalleryPhoto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { publicId } = req.params;
        const decodedId = decodeURIComponent(publicId);

        let info = await RestaurantInfo.findOne();
        if (!info) return next(createError('Información del restaurante no encontrada.', 404));

        const photo = info.gallery.find(p => p.publicId === decodedId);
        if (!photo) return next(createError('Foto no encontrada.', 404));

        await deleteFromCloudinary(decodedId);
        info.gallery = info.gallery.filter(p => p.publicId !== decodedId);
        await info.save();

        res.json({ success: true, message: 'Foto eliminada.', data: { gallery: info.gallery } });
    } catch (error) { next(error); }
};
