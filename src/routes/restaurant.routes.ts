import { Router } from 'express';
import {
  getRestaurantInfo, updateRestaurantInfo,
  addGalleryPhoto, deleteGalleryPhoto,
} from '../controllers/restaurant.controller';
import { protect } from '../middlewares/auth.middleware';
import { adminOnly } from '../middlewares/admin.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.get('/',  getRestaurantInfo);
router.put('/',  protect, adminOnly, updateRestaurantInfo);
router.post('/gallery',          protect, adminOnly, upload.single('photo'), addGalleryPhoto);
router.delete('/gallery/:publicId', protect, adminOnly, deleteGalleryPhoto);

export default router;