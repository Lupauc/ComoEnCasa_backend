import { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '../controllers/category.controller';
import { protect, optionalAuth } from '../middlewares/auth.middleware';

import { adminOnly } from '../middlewares/admin.middleware';

const router = Router();
router.get('/', optionalAuth, getCategories);
router.get('/:id', getCategoryById);
router.post('/', protect, adminOnly, createCategory);
router.put('/reorder', protect, adminOnly, reorderCategories);
router.put('/:id', protect, adminOnly, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

export default router;
