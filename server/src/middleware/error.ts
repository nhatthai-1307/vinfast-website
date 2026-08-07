import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Không tìm thấy tài nguyên với id: ${err.value}`;
    error = new Error(message);
    (error as any).statusCode = 444;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Dữ liệu đã tồn tại trong hệ thống';
    error = new Error(message);
    (error as any).statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val: any) => val.message).join(', ');
    error = new Error(message);
    (error as any).statusCode = 400;
  }

  const statusCode = error.statusCode || err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Lỗi hệ thống',
  });
};
export default errorHandler;
