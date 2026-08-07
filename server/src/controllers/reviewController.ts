import { Request, Response, NextFunction } from 'express';
import Review from '../models/Review';
import { AuthRequest } from '../middleware/auth';

// @desc    Get reviews for a car
// @route   GET /api/reviews/:carId
// @access  Public
export const getReviewsByCarId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviews = await Review.find({ car: req.params.carId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { carId, rating, comment, images } = req.body;

    // Check if user already reviewed this car
    const alreadyReviewed = await Review.findOne({ user: req.user.id, car: carId });
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'Bạn đã gửi đánh giá cho dòng xe này rồi' });
    }

    const review = await Review.create({
      user: req.user.id,
      car: carId,
      rating: Number(rating),
      comment,
      images: images || [],
    });

    const populatedReview = await review.populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      review: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};
