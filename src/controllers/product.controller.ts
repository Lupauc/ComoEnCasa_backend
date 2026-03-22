import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service';
import { createError } from '../middlewares/errorHandler';

// GET /api/products
export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { category, featured, search, available } = req.query;
        const filter: Record<string, unknown> = {};

        // Los usuarios públicos solo ven productos disponibles; el admin los ve todos.
        if (req.user?.role !== 'admin') {
            filter.isAvailable = true;
        } else if (available !== undefined) {
            filter.isAvailable = available === 'true';
        }

        if (category) {
            // Permite filtrar por slug de categoría o por id.
            const Category = (await import('../models/Category')).default;
            const cat = await Category.findOne({ $or: [{ slug: category }, { _id: category }] });
            if (cat) filter.category = cat._id;
        }

        if (featured === 'true') filter.isFeatured = true;

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { ingredients: { $regex: search, $options: 'i' } },
            ];
        }

        const products = await Product.find(filter)
            .populate('category', 'name slug emoji')
            .sort({ order: 1, createdAt: -1 });

        res.json({ success: true, data: { products, count: products.length } });
    } catch (error) {
        next(error);
    }
};

// GET /api/products/menu — productos agrupados por categoría para la página del menú
export const getMenu = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const Category = (await import('../models/Category')).default;

        const categories = await Category.find({ isActive: true }).sort({ order: 1 });

        const menu = await Promise.all(
            categories.map(async (cat) => {
                const products = await Product.find({
                    category: cat._id,
                    isAvailable: true,
                }).sort({ order: 1 });

                return { category: cat, products };
            })
        );

        // Quita las categorías que se quedarían vacías.
        const filteredMenu = menu.filter((section) => section.products.length > 0);

        res.json({ success: true, data: { menu: filteredMenu } });
    } catch (error) {
        next(error);
    }
};

// GET /api/products/:id
export const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name slug emoji');
        if (!product) return next(createError('Product not found.', 404));
        res.json({ success: true, data: { product } });
    } catch (error) {
        next(error);
    }
};

// POST /api/products  [ADMIN]
export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, description, price, category, ingredients, allergens, isAvailable, isFeatured, order } = req.body;

        let image = '';
        let imagePublicId = '';

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, 'comoencasa/products');
            image = result.secure_url;
            imagePublicId = result.public_id;
        }

        const product = await Product.create({
            name,
            description,
            price: parseFloat(price),
            category,
            image,
            imagePublicId,
            ingredients: Array.isArray(ingredients) ? ingredients : ingredients ? JSON.parse(ingredients) : [],
            allergens: Array.isArray(allergens) ? allergens : allergens ? JSON.parse(allergens) : [],
            isAvailable: isAvailable !== undefined ? isAvailable === 'true' || isAvailable === true : true,
            isFeatured: isFeatured === 'true' || isFeatured === true,
            order: order ? parseInt(order) : 0,
        });

        const populated = await product.populate('category', 'name slug emoji');

        res.status(201).json({ success: true, message: 'Product created.', data: { product: populated } });
    } catch (error) {
        next(error);
    }
};

// PUT /api/products/:id  [ADMIN]
export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, description, price, category, ingredients, allergens, isAvailable, isFeatured, order } = req.body;

        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (category !== undefined) updateData.category = category;
        if (ingredients !== undefined) updateData.ingredients = Array.isArray(ingredients) ? ingredients : JSON.parse(ingredients);
        if (allergens !== undefined) updateData.allergens = Array.isArray(allergens) ? allergens : JSON.parse(allergens);
        if (isAvailable !== undefined) updateData.isAvailable = isAvailable === 'true' || isAvailable === true;
        if (isFeatured !== undefined) updateData.isFeatured = isFeatured === 'true' || isFeatured === true;
        if (order !== undefined) updateData.order = parseInt(order);

        const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        }).populate('category', 'name slug emoji');

        if (!product) return next(createError('Product not found.', 404));

        res.json({ success: true, message: 'Product updated.', data: { product } });
    } catch (error) {
        next(error);
    }
};

// PUT /api/products/:id/image  [ADMIN]
export const updateProductImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.file) return next(createError('No image provided.', 400));

        const product = await Product.findById(req.params.id);
        if (!product) return next(createError('Product not found.', 404));

        // Borra la imagen anterior antes de guardar la nueva.
        if (product.imagePublicId) {
            await deleteFromCloudinary(product.imagePublicId);
        }

        const result = await uploadToCloudinary(req.file.buffer, 'comoencasa/products');
        product.image = result.secure_url;
        product.imagePublicId = result.public_id;
        await product.save();

        res.json({ success: true, message: 'Image updated.', data: { image: product.image } });
    } catch (error) {
        next(error);
    }
};

// PUT /api/products/:id/availability  [ADMIN]
export const toggleAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return next(createError('Product not found.', 404));

        product.isAvailable = !product.isAvailable;
        await product.save();

        res.json({
            success: true,
            message: `Product is now ${product.isAvailable ? 'available' : 'unavailable'}.`,
            data: { isAvailable: product.isAvailable },
        });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/products/:id  [ADMIN]
export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return next(createError('Product not found.', 404));

        if (product.imagePublicId) {
            await deleteFromCloudinary(product.imagePublicId);
        }

        await product.deleteOne();

        res.json({ success: true, message: 'Product deleted.' });
    } catch (error) {
        next(error);
    }
};

// PUT /api/products/reorder  [ADMIN]
export const reorderProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { ids } = req.body as { ids: string[] };

        if (!Array.isArray(ids) || ids.length === 0) {
            return next(createError('ids must be a non-empty array.', 400));
        }

        const bulkOps = ids.map((id, index) => ({
            updateOne: { filter: { _id: id }, update: { $set: { order: index } } },
        }));

        await Product.bulkWrite(bulkOps);

        res.json({ success: true, message: 'Products reordered.' });
    } catch (error) {
        next(error);
    }
};
