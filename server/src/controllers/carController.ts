import { Request, Response, NextFunction } from 'express';
import Car from '../models/Car';

// @desc    Get all cars with filtering
// @route   GET /api/cars
// @access  Public
export const getCars = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, category, seats, minPrice, maxPrice, sortBy, isFeatured, isNewest } = req.query;

    const query: any = {};

    // Search by name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Filter by SUV Category (Mini, A-SUV, B-SUV, C-SUV etc)
    if (category) {
      query.category = category;
    }

    // Filter by seats number
    if (seats) {
      query.seats = Number(seats);
    }

    // Filter by Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Special tags
    if (isFeatured === 'true') {
      query.isFeatured = true;
    }
    if (isNewest === 'true') {
      query.isNewest = true;
    }

    // Build query execution
    let reqQuery = Car.find(query);

    // Sorting
    if (sortBy) {
      switch (sortBy) {
        case 'price-asc':
          reqQuery = reqQuery.sort({ price: 1 });
          break;
        case 'price-desc':
          reqQuery = reqQuery.sort({ price: -1 });
          break;
        case 'newest':
          reqQuery = reqQuery.sort({ createdAt: -1 });
          break;
        default:
          reqQuery = reqQuery.sort({ name: 1 });
      }
    } else {
      reqQuery = reqQuery.sort({ name: 1 });
    }

    const cars = await reqQuery;

    res.json({
      success: true,
      count: cars.length,
      cars,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single car by slug
// @route   GET /api/cars/:slug
// @access  Public
export const getCarBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const car = await Car.findOne({ slug: req.params.slug });

    if (!car) {
      return res.status(444).json({ success: false, message: 'Không tìm thấy dòng xe này' });
    }

    res.json({
      success: true,
      car,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a car
// @route   POST /api/cars
// @access  Private/Admin
export const createCar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const car = await Car.create(req.body);

    res.status(201).json({
      success: true,
      car,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a car
// @route   PUT /api/cars/:id
// @access  Private/Admin
export const updateCar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!car) {
      return res.status(444).json({ success: false, message: 'Không tìm thấy dòng xe cần sửa' });
    }

    res.json({
      success: true,
      car,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a car
// @route   DELETE /api/cars/:id
// @access  Private/Admin
export const deleteCar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);

    if (!car) {
      return res.status(444).json({ success: false, message: 'Không tìm thấy dòng xe cần xóa' });
    }

    res.json({
      success: true,
      message: 'Xóa xe thành công',
    });
  } catch (error) {
    next(error);
  }
};
