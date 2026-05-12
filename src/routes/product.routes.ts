import { Router } from 'express';
import {
  getProducts,
  getMenu,
  getProductById,
  createProduct,
  updateProduct,
  updateProductImage,
  toggleAvailability,
  deleteProduct,
  reorderProducts,
} from '../controllers/product.controller';
import { protect } from '../middlewares/auth.middleware';
import { adminOnly } from '../middlewares/admin.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();
router.get('/menu', getMenu);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, adminOnly, upload.single('image'), createProduct);
router.put('/reorder', protect, adminOnly, reorderProducts);
router.put('/:id', protect, adminOnly, updateProduct);
router.put('/:id/image', protect, adminOnly, upload.single('image'), updateProductImage);
router.put('/:id/availability', protect, adminOnly, toggleAvailability);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
