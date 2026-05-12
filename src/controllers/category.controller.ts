import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category';
import Product from '../models/Product';
import { createError } from '../middlewares/errorHandler';

// GET /api/categories
export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const filter = req.user?.role === 'admin' ? {} : { isActive: true };
        const categories = await Category.find(filter).sort({ order: 1 });
        res.json({ success: true, data: { categories } });
    } catch (error) {
        next(error);
    }
};

// GET /api/categories/:id
export const getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return next(createError('Categoría no encontrada.', 404));

        const products = await Product.find({ category: category._id, isAvailable: true }).sort({ order: 1 });

        res.json({ success: true, data: { category, products } });
    } catch (error) {
        next(error);
    }
};

// POST /api/categories  [ADMIN]
export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, slug, emoji, order } = req.body;

        const existing = await Category.findOne({ slug });
        if (existing) return next(createError('Ya existe una categoría con ese slug.', 409));

        // Si no viene un orden, la coloco al final automáticamente.
        const maxOrder = await Category.find().sort({ order: -1 }).limit(1);
        const nextOrder = order ?? (maxOrder[0] ? maxOrder[0].order + 1 : 0);

        const category = await Category.create({ name, slug, emoji, order: nextOrder });
        res.status(201).json({ success: true, message: 'Categoría creada.', data: { category } });
    } catch (error) {
        next(error);
    }
};

// PUT /api/categories/:id  [ADMIN]
export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, slug, emoji, isActive } = req.body;

        if (slug) {
            const existing = await Category.findOne({ slug, _id: { $ne: req.params.id } });
            if (existing) return next(createError('Ya existe una categoría con ese slug.', 409));
        }

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, slug, emoji, isActive },
            { new: true, runValidators: true }
        );

        if (!category) return next(createError('Categoría no encontrada.', 404));

        res.json({ success: true, message: 'Categoría actualizada.', data: { category } });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/categories/:id  [ADMIN]
export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const productCount = await Product.countDocuments({ category: req.params.id });
        if (productCount > 0) {
            return next(createError(`No se puede eliminar: esta categoría tiene ${productCount} producto(s). Muévelos o elimínalos antes.`, 400));
        }

        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return next(createError('Categoría no encontrada.', 404));

        res.json({ success: true, message: 'Categoría eliminada.' });
    } catch (error) {
        next(error);
    }
};

// PUT /api/categories/reorder  [ADMIN]
export const reorderCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { ids } = req.body as { ids: string[] };

        if (!Array.isArray(ids) || ids.length === 0) {
            return next(createError('El campo ids debe ser un array no vacío.', 400));
        }

        const bulkOps = ids.map((id, index) => ({
            updateOne: {
                filter: { _id: id },
                update: { $set: { order: index } },
            },
        }));

        await Category.bulkWrite(bulkOps);

        res.json({ success: true, message: 'Categorías reordenadas.' });
    } catch (error) {
        next(error);
    }
};
