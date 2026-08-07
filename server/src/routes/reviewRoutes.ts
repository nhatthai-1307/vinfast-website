import { Router } from 'express';
import { getReviewsByCarId, createReview } from '../controllers/reviewController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/:carId', getReviewsByCarId);
router.post('/', protect, createReview);

export default router;
