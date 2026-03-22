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

// Públicas
router.get('/', optionalAuth, getCategories);
router.get('/:id', getCategoryById);

// Administrador
router.post('/', protect, adminOnly, createCategory);
router.put('/reorder', protect, adminOnly, reorderCategories);
router.put('/:id', protect, adminOnly, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

export default router;
