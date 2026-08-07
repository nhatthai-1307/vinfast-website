import { Router } from 'express';
import { createOrder, getMyOrders, getOrders, getOrderById, updateOrderStatus } from '../controllers/orderController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Allow booking for guests too (without protect, we handle user attachment in controller if req.user is set)
router.post('/', (req, res, next) => {
  // If authorization header exists, authenticate it, otherwise proceed as guest
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, createOrder);

router.get('/my-orders', protect, getMyOrders);
router.get('/', protect, authorize('admin', 'staff'), getOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, authorize('admin', 'staff'), updateOrderStatus);

export default router;
