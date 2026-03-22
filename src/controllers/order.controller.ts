import { Request, Response, NextFunction } from 'express';
import Order, { OrderStatus } from '../models/Order';
import { createError } from '../middlewares/errorHandler';

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['delivered'],
    delivered: [],
    cancelled: [],
};

// POST /api/orders
export const createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user!;
        if (!user.isEmailVerified) return next(createError('Please verify your email before placing an order.', 403));

        const { items, pickupDate, pickupTime, notes } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0)
            return next(createError('Order must contain at least one item.', 400));

        const Product = (await import('../models/Product')).default;
        const orderItems = [];
        let total = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product || !product.isAvailable)
                return next(createError(`Product ${item.product} not available.`, 400));
            const subtotal = product.price * item.quantity;
            total += subtotal;
            orderItems.push({ product: product._id, name: product.name, price: product.price, quantity: item.quantity, subtotal });
        }

        const count = await Order.countDocuments();
        const orderNumber = `ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(count + 1).padStart(4, '0')}`;

        const order = await Order.create({
            orderNumber, user: user._id, items: orderItems, total,
            pickupDate: pickupDate ? new Date(pickupDate) : undefined,
            pickupTime: pickupTime || '',
            customerName: user.name, customerEmail: user.email,
            customerPhone: user.phone || '',
            notes: notes || '',
            statusHistory: [{ status: 'pending', changedAt: new Date(), changedBy: user._id }],
        });

        res.status(201).json({ success: true, message: 'Order created.', data: { order } });
    } catch (error) { next(error); }
};

// GET /api/orders/my-orders
export const getMyOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const orders = await Order.find({ user: req.user!._id }).sort({ createdAt: -1 }).populate('items.product', 'name image');
        res.json({ success: true, data: { orders } });
    } catch (error) { next(error); }
};

// GET /api/orders/my-orders/:id
export const getMyOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user!._id }).populate('items.product');
        if (!order) return next(createError('Order not found.', 404));
        res.json({ success: true, data: { order } });
    } catch (error) { next(error); }
};

// PUT /api/orders/my-orders/:id/cancel
export const cancelMyOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user!._id });
        if (!order) return next(createError('Order not found.', 404));
        if (order.status !== 'pending')
            return next(createError(`Cannot cancel order with status "${order.status}".`, 400));
        order.status = 'cancelled';
        order.statusHistory.push({ status: 'cancelled', changedAt: new Date(), changedBy: req.user!._id });
        await order.save();
        res.json({ success: true, message: 'Order cancelled.', data: { order } });
    } catch (error) { next(error); }
};

// GET /api/orders [ADMIN]
export const getAllOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { status, date, search } = req.query;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const filter: Record<string, unknown> = {};
        if (status) filter.status = status;
        if (date) filter.createdAt = { $gte: new Date(date as string), $lt: new Date(new Date(date as string).getTime() + 86400000) };
        if (search) filter.$or = [{ orderNumber: { $regex: search, $options: 'i' } }, { customerName: { $regex: search, $options: 'i' } }];
        const [orders, total] = await Promise.all([
            Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'name email'),
            Order.countDocuments(filter),
        ]);
        res.json({ success: true, data: { orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
    } catch (error) { next(error); }
};

// GET /api/orders/:id [ADMIN]
export const getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email phone').populate('items.product', 'name image');
        if (!order) return next(createError('Order not found.', 404));
        res.json({ success: true, data: { order } });
    } catch (error) { next(error); }
};

// PUT /api/orders/:id/status [ADMIN] — acepta cancelReason opcional
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { status, cancelReason } = req.body as { status: OrderStatus; cancelReason?: string };
        const order = await Order.findById(req.params.id);
        if (!order) return next(createError('Order not found.', 404));

        const allowedNext = VALID_TRANSITIONS[order.status];
        if (!allowedNext.includes(status))
            return next(createError(`Cannot transition from "${order.status}" to "${status}". Allowed: ${allowedNext.join(', ') || 'none'}.`, 400));

        order.status = status;
        if (status === 'cancelled' && cancelReason?.trim()) {
            order.cancelReason = cancelReason.trim();
        }
        order.statusHistory.push({ status, changedAt: new Date(), changedBy: req.user!._id });
        await order.save();

        res.json({ success: true, message: `Order status updated to ${status}.`, data: { order } });
    } catch (error) { next(error); }
};