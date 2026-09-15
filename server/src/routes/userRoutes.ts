import { Router } from 'express';
import { getAllUsers, updateUserRole, deleteUser } from '../controllers/userController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// All routes require admin auth
router.use(protect, authorize('admin'));

router.get('/', getAllUsers);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

export default router;
