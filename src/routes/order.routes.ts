import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getMyOrderById,
  cancelMyOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/order.controller';
import { protect } from '../middlewares/auth.middleware';
import { adminOnly } from '../middlewares/admin.middleware';

const router = Router();
router.use(protect);
router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/my-orders/:id', getMyOrderById);
router.put('/my-orders/:id/cancel', cancelMyOrder);
router.get('/', adminOnly, getAllOrders);
router.get('/:id', adminOnly, getOrderById);
router.put('/:id/status', adminOnly, updateOrderStatus);

export default router;
