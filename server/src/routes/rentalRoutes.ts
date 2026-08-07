import { Router } from 'express';
import {
  createRental,
  getMyRentals,
  getAllRentals,
  updateRentalStatus,
  cancelRental,
} from '../controllers/rentalController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// POST /api/rentals - Create a new rental (public: guests can rent without account)
router.post('/', createRental);

// GET /api/rentals/my-rentals - Get current user's rentals (private)
router.get('/my-rentals', protect, getMyRentals);

// GET /api/rentals - Get all rentals (admin only)
router.get('/', protect, authorize('admin', 'staff'), getAllRentals);

// PUT /api/rentals/:id/status - Update rental status (admin only)
router.put('/:id/status', protect, authorize('admin', 'staff'), updateRentalStatus);

// PUT /api/rentals/:id/cancel - Cancel own rental (private)
router.put('/:id/cancel', protect, cancelRental);

export default router;
