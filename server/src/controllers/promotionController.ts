import { Request, Response, NextFunction } from 'express';
import Promotion from '../models/Promotion';
import { AuthRequest } from '../middleware/auth';

// @desc    Apply a promotion code
// @route   POST /api/promotions/apply
// @access  Public
export const applyPromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã giảm giá' });
    }

    const promotion = await Promotion.findOne({ 
      code: code.toUpperCase(),
      isActive: true,
      expiryDate: { $gt: new Date() }
    });

    if (!promotion) {
      return res.status(404).json({ success: false, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
    }

    const type = promotion.discountPercentage > 0 ? 'percent' : 'fixed';
    const value = promotion.discountPercentage > 0 ? promotion.discountPercentage : promotion.discountAmount;

    res.json({
      success: true,
      promotion: {
        _id: promotion._id,
        code: promotion.code,
        description: promotion.description,
        type,
        value,
        expiryDate: promotion.expiryDate
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all promotions
// @route   GET /api/promotions
// @access  Private/Admin
export const getPromotions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const promotions = await Promotion.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: promotions.length,
      promotions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a promotion
// @route   POST /api/promotions
// @access  Private/Admin
export const createPromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, discountAmount, discountPercentage, expiryDate, description, isActive } = req.body;

    const promotionExists = await Promotion.findOne({ code: code.toUpperCase() });
    if (promotionExists) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá này đã tồn tại' });
    }

    const promotion = await Promotion.create({
      code: code.toUpperCase(),
      discountAmount: Number(discountAmount || 0),
      discountPercentage: Number(discountPercentage || 0),
      expiryDate: new Date(expiryDate),
      description,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      success: true,
      promotion
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a promotion
// @route   PUT /api/promotions/:id
// @access  Private/Admin
export const updatePromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mã giảm giá' });
    }

    const { code, discountAmount, discountPercentage, expiryDate, description, isActive } = req.body;

    if (code) promotion.code = code.toUpperCase();
    if (discountAmount !== undefined) promotion.discountAmount = Number(discountAmount);
    if (discountPercentage !== undefined) promotion.discountPercentage = Number(discountPercentage);
    if (expiryDate) promotion.expiryDate = new Date(expiryDate);
    if (description) promotion.description = description;
    if (isActive !== undefined) promotion.isActive = isActive;

    await promotion.save();

    res.json({
      success: true,
      promotion
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a promotion
// @route   DELETE /api/promotions/:id
// @access  Private/Admin
export const deletePromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mã giảm giá' });
    }

    await promotion.deleteOne();

    res.json({
      success: true,
      message: 'Xóa mã giảm giá thành công'
    });
  } catch (error) {
    next(error);
  }
};
