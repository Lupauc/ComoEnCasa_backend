// src/routes/contact.routes.ts
import { Router } from 'express';
import { createContact, getContacts, markAsRead, deleteContact } from '../controllers/contact.controller';
import { protect } from '../middlewares/auth.middleware';
import { adminOnly } from '../middlewares/admin.middleware';

const router = Router();

// Rutas de cliente
router.post('/', createContact);

// Rutas de administrador
router.get('/', protect, adminOnly, getContacts);
router.put('/:id/read', protect, adminOnly, markAsRead);
router.delete('/:id', protect, adminOnly, deleteContact);

export default router;