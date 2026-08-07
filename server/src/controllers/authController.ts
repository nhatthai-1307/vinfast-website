import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { generateAccessToken, generateRefreshToken } from '../utils/token';
import { AuthRequest } from '../middleware/auth';
import { sendOtpEmail } from '../utils/sendEmail';

// Helper to generate 6-digit OTP code
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register user - Sends OTP to Email
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists
    let user = await User.findOne({ email: cleanEmail });
    if (user) {
      if (user.isEmailConfirmed) {
        return res.status(400).json({ success: false, message: 'Email này đã được đăng ký và xác thực' });
      }
      // If registered before but email not confirmed, update OTP and details
      user.name = name;
      user.password = password; // Pre-save hook will hash it
      user.phone = phone;
      user.otpCode = generateOTP();
      user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();
    } else {
      // Create new user with OTP
      const otpCode = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      user = await User.create({
        name,
        email: cleanEmail,
        password,
        phone,
        isEmailConfirmed: false,
        otpCode,
        otpExpiry,
      });
    }

    // Send real OTP email using Nodemailer
    await sendOtpEmail({
      to: user.email,
      name: user.name,
      otpCode: user.otpCode!,
    });

    console.log(`[AUTH] Mã OTP xác thực Email cho [${user.email}]: ${user.otpCode}`);

    res.status(200).json({
      success: true,
      requireOtp: true,
      email: user.email,
      otpCode: user.otpCode,
      message: `Mã xác thực OTP đã được gửi thẳng đến Email [${user.email}]. Vui lòng kiểm tra hộp thư.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP Code & Activate Account
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập Email và mã OTP' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản người dùng' });
    }

    if (user.isEmailConfirmed) {
      return res.status(400).json({ success: false, message: 'Tài khoản này đã được xác thực thành công trước đó' });
    }

    if (!user.otpCode || user.otpCode !== otpCode.trim()) {
      return res.status(400).json({ success: false, message: 'Mã OTP không chính xác. Vui lòng kiểm tra lại.' });
    }

    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      return res.status(400).json({ success: false, message: 'Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại mã mới.' });
    }

    // Activate user
    user.isEmailConfirmed = true;
    user.otpCode = '';
    user.otpExpiry = undefined;

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Xác thực Email thành công! Tài khoản của bạn đã được kích hoạt.',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        isEmailConfirmed: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend OTP Code
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp địa chỉ Email' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản với Email này' });
    }

    if (user.isEmailConfirmed) {
      return res.status(400).json({ success: false, message: 'Tài khoản này đã được xác thực trước đó' });
    }

    const newOtp = generateOTP();
    user.otpCode = newOtp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await user.save();

    // Send real OTP email
    await sendOtpEmail({
      to: user.email,
      name: user.name,
      otpCode: newOtp,
    });

    console.log(`[AUTH] Gửi lại mã OTP mới cho [${user.email}]: ${newOtp}`);

    res.status(200).json({
      success: true,
      email: user.email,
      otpCode: newOtp,
      message: `Mã OTP mới đã được gửi thẳng đến Email [${user.email}].`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email và mật khẩu' });
    }

    // Check for user
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    // Check if email is confirmed
    if (!user.isEmailConfirmed) {
      // Auto generate new OTP for unverified user attempting login
      const newOtp = generateOTP();
      user.otpCode = newOtp;
      user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      await sendOtpEmail({
        to: user.email,
        name: user.name,
        otpCode: newOtp,
      });

      return res.status(403).json({
        success: false,
        requireOtp: true,
        email: user.email,
        otpCode: newOtp,
        message: 'Tài khoản chưa được xác thực Email. Vui lòng nhập mã OTP gửi tới Email để kích hoạt.',
      });
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        isEmailConfirmed: user.isEmailConfirmed,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token là bắt buộc' });
    }

    const decoded: any = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'vinfast_jwt_refresh_secret_key_2026_super_secure_64_chars'
    );

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token không hợp lệ hoặc không trùng khớp' });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id.toString());
    const newRefreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Refresh token đã hết hạn hoặc không hợp lệ' });
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshToken = '';
      await user.save();
    }
    res.json({ success: true, message: 'Đăng xuất thành công' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/update-details
// @access  Private
export const updateDetails = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      avatar: req.body.avatar,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
