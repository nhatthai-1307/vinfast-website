import { Router } from 'express';
import { getStats } from '../controllers/dashboardController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.get('/stats', protect, authorize('admin'), getStats);

export default router;
