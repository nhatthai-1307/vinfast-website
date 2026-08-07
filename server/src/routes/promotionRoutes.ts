import { Router } from 'express';
import { 
  applyPromotion, 
  getPromotions, 
  createPromotion, 
  updatePromotion, 
  deletePromotion 
} from '../controllers/promotionController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Public route to apply a coupon
router.post('/apply', applyPromotion);

// Admin-only routes for CRUD promotions
router.route('/')
  .get(protect, authorize('admin'), getPromotions)
  .post(protect, authorize('admin'), createPromotion);

router.route('/:id')
  .put(protect, authorize('admin'), updatePromotion)
  .delete(protect, authorize('admin'), deletePromotion);

export default router;
