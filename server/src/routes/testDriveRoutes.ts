import { Router } from 'express';
import { createTestDrive, getMyTestDrives, getTestDrives, updateTestDriveStatus } from '../controllers/testDriveController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Allow registering for test drives as guest, or authenticated user
router.post('/', (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, createTestDrive);

router.get('/my-drives', protect, getMyTestDrives);
router.get('/', protect, authorize('admin', 'staff'), getTestDrives);
router.put('/:id/status', protect, authorize('admin', 'staff'), updateTestDriveStatus);

export default router;
