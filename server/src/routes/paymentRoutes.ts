import { Router } from 'express';
import { createPaymentUrl, vnpayReturn } from '../controllers/paymentController';
import { protect } from '../middleware/auth';

const router = Router();

// Allow authenticated or guest user to create payment URL
router.post('/create_payment_url', (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, createPaymentUrl);

// VNPay return callback
router.get('/vnpay_return', vnpayReturn);

export default router;
