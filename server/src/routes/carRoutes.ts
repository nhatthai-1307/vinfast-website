import { Router } from 'express';
import { getCars, getCarBySlug, createCar, updateCar, deleteCar } from '../controllers/carController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.route('/')
  .get(getCars)
  .post(protect, authorize('admin'), createCar);

router.route('/:slug')
  .get(getCarBySlug);

router.route('/:id')
  .put(protect, authorize('admin'), updateCar)
  .delete(protect, authorize('admin'), deleteCar);

export default router;
