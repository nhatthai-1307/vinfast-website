import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Không tìm thấy token xác thực, vui lòng đăng nhập' });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'vinfast_jwt_secret_key_2026_super_secure_32_chars');
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Người dùng sở hữu token này không tồn tại' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Quyền truy cập bị từ chối cho vai trò: ${req.user ? req.user.role : 'guest'}`,
      });
    }
    next();
  };
};
