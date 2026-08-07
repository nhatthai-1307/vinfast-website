import { Router } from 'express';
import { register, verifyOtp, resendOtp, login, refresh, logout, getMe, updateDetails } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/update-details', protect, updateDetails);

export default router;
