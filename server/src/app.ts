import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';

// Import Routes
import authRoutes from './routes/authRoutes';
import carRoutes from './routes/carRoutes';
import orderRoutes from './routes/orderRoutes';
import testDriveRoutes from './routes/testDriveRoutes';
import reviewRoutes from './routes/reviewRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import rentalRouter from './routes/rentalRoutes';
import uploadRouter from './routes/uploadRoutes';
import promotionRoutes from './routes/promotionRoutes';


// Import Error Handler
import { errorHandler } from './middleware/error';

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow local images if static
}));

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 200, // Limit each IP to 200 requests per window
  message: {
    success: false,
    message: 'Bạn đã thực hiện quá nhiều yêu cầu từ IP này. Vui lòng thử lại sau 15 phút.',
  },
});
app.use('/api/', limiter);

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/test-drives', testDriveRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRouter);
app.use('/api/promotions', promotionRoutes);
// Đảm bảo thư mục uploads tồn tại
const uploadsDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

app.use('/api/rentals', rentalRouter);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to VinFast Electric Car Ecommerce API' });
});

// Central Error Handler
app.use(errorHandler);

export default app;
