import { Router } from 'express';
import {
    getProfile,
    updateProfile,
    updateAvatar,
    changePassword,
    getAllUsers,
    getUserById,
    deleteUser,
} from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';
import { adminOnly } from '../middlewares/admin.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();
router.use(protect);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/profile/avatar', upload.single('avatar'), updateAvatar);
router.put('/change-password', changePassword);
router.get('/', adminOnly, getAllUsers);
router.get('/:id', adminOnly, getUserById);
router.delete('/:id', adminOnly, deleteUser);

export default router;
