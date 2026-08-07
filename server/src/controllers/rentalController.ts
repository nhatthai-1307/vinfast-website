import { Response, NextFunction } from 'express';
import Rental from '../models/Rental';
import Car from '../models/Car';
import { AuthRequest } from '../middleware/auth';

// @desc    Create a new rental booking
// @route   POST /api/rentals
// @access  Public (guests can rent without account)
export const createRental = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      carId,
      customerInfo,
      pickupDate,
      returnDate,
      pricePerDay,
      withDriver,
      deliveryAddress,
      pickupLocation,
      selectedColor,
      depositPaid,
      paymentGateway,
      voucherCode,
      discountAmount,
      notes,
    } = req.body;

    // Validate car exists
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy xe cần thuê' });
    }

    // Validate dates
    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);

    if (isNaN(pickup.getTime()) || isNaN(returnD.getTime())) {
      return res.status(400).json({ success: false, message: 'Ngày nhận xe hoặc ngày trả xe không hợp lệ' });
    }

    if (returnD <= pickup) {
      return res.status(400).json({ success: false, message: 'Ngày trả xe phải sau ngày nhận xe' });
    }

    // Calculate total days (minimum 1 day)
    const totalDays = Math.ceil((returnD.getTime() - pickup.getTime()) / 86400000);

    // Calculate total amount
    const dailyRate = pricePerDay || car.price / 30; // fallback: monthly price / 30
    const discount = discountAmount || 0;
    const totalAmount = dailyRate * totalDays - discount;

    // Build rental data
    const rentalData: any = {
      car: carId,
      customerInfo,
      pickupDate: pickup,
      returnDate: returnD,
      totalDays,
      pricePerDay: dailyRate,
      totalAmount: Math.max(0, totalAmount),
      withDriver: withDriver || false,
      deliveryAddress: deliveryAddress || '',
      pickupLocation: pickupLocation || 'Showroom VinFast',
      selectedColor: selectedColor || '',
      depositPaid: depositPaid || 0,
      paymentGateway: paymentGateway || '',
      discountAmount: discount,
      notes: notes || '',
    };

    if (voucherCode) {
      rentalData.voucherCode = voucherCode;
    }

    // Link to user account if logged in
    if (req.user) {
      rentalData.user = req.user.id;
    }

    const rental = await Rental.create(rentalData);
    const populatedRental = await rental.populate({
      path: 'car',
      select: 'name slug price images category',
    });

    // Realtime notification via socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('newRental', {
        rentalNumber: rental.rentalNumber,
        carName: (car as any).name,
        customerName: customerInfo.name,
        totalDays,
        totalAmount: rental.totalAmount,
        createdAt: rental.createdAt,
      });
    }

    res.status(201).json({
      success: true,
      message: `Đặt thuê xe thành công! Mã đơn thuê: ${rental.rentalNumber}`,
      rental: populatedRental,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's rental bookings
// @route   GET /api/rentals/my-rentals
// @access  Private
export const getMyRentals = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const rentals = await Rental.find({ user: req.user.id })
      .populate({
        path: 'car',
        select: 'name slug price images',
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: rentals.length,
      rentals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all rental bookings (Admin)
// @route   GET /api/rentals
// @access  Private/Admin
export const getAllRentals = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter: any = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Rental.countDocuments(filter);

    const rentals = await Rental.find(filter)
      .populate({
        path: 'car',
        select: 'name slug price images category',
      })
      .populate({
        path: 'user',
        select: 'name email phone',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: rentals.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      rentals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update rental status (Admin)
// @route   PUT /api/rentals/:id/status
// @access  Private/Admin
export const updateRentalStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Trạng thái không hợp lệ. Phải là một trong: ${validStatuses.join(', ')}`,
      });
    }

    const rental = await Rental.findById(req.params.id).populate({
      path: 'car',
      select: 'name slug price images',
    });

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn thuê xe' });
    }

    rental.status = status;
    await rental.save();

    // Realtime notification via socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('rentalStatusUpdated', {
        userId: rental.user?.toString(),
        rentalNumber: rental.rentalNumber,
        status,
      });
    }

    res.json({
      success: true,
      message: `Đã cập nhật trạng thái đơn thuê thành "${status}"`,
      rental,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a rental booking (User - only when pending)
// @route   PUT /api/rentals/:id/cancel
// @access  Private
export const cancelRental = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn thuê xe' });
    }

    // Authorization check: only the owner can cancel their own rental
    if (!rental.user || rental.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền hủy đơn thuê này' });
    }

    // Only allow cancel when status is 'pending'
    if (rental.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Không thể hủy đơn thuê có trạng thái "${rental.status}". Chỉ có thể hủy khi đơn đang chờ xác nhận`,
      });
    }

    rental.status = 'cancelled';
    await rental.save();

    const populatedRental = await rental.populate({
      path: 'car',
      select: 'name slug price images',
    });

    res.json({
      success: true,
      message: `Đã hủy đơn thuê xe ${rental.rentalNumber} thành công`,
      rental: populatedRental,
    });
  } catch (error) {
    next(error);
  }
};
