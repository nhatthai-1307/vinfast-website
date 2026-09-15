import { Response, NextFunction } from 'express';
import User from '../models/User';
import Order from '../models/Order';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all users (admin)
// @route   GET /api/users
// @access  Admin
export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await User.find().select('-password -refreshToken -otpCode').sort({ createdAt: -1 });

    // Count orders per user
    const orderCounts = await Order.aggregate([
      { $match: { user: { $ne: null } } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]);
    const orderMap = new Map(orderCounts.map((o: any) => [o._id.toString(), o.count]));

    const usersWithOrders = users.map((u) => ({
      ...u.toObject(),
      ordersCount: orderMap.get(u._id.toString()) || 0,
    }));

    res.json({ success: true, count: usersWithOrders.length, users: usersWithOrders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (admin)
// @route   PUT /api/users/:id/role
// @access  Admin
export const updateUserRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;
    if (!['admin', 'staff', 'customer'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Vai trò không hợp lệ' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password -refreshToken -otpCode');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (admin)
// @route   DELETE /api/users/:id
// @access  Admin
export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Không thể xóa tài khoản admin' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa người dùng' });
  } catch (error) {
    next(error);
  }
};
