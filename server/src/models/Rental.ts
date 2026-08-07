import mongoose, { Document, Schema } from 'mongoose';

export interface IRental extends Document {
  user?: mongoose.Types.ObjectId;
  car: mongoose.Types.ObjectId;
  // Customer info
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    idCard: string;
    address: string;
  };
  // Rental details
  pickupDate: Date;
  returnDate: Date;
  totalDays: number;
  pricePerDay: number;
  totalAmount: number;
  // Options
  withDriver: boolean;
  deliveryAddress: string; // empty = self pickup
  pickupLocation: string;
  // Car config at time of rental
  selectedColor: string;
  // Status
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  rentalNumber: string;
  // Payment
  depositPaid: number;
  paymentGateway: string;
  voucherCode?: string;
  discountAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RentalSchema = new Schema<IRental>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    car: {
      type: Schema.Types.ObjectId,
      ref: 'Car',
      required: [true, 'Vui lòng chọn xe cần thuê'],
    },
    customerInfo: {
      name: { type: String, required: [true, 'Vui lòng nhập họ tên'], trim: true },
      email: { type: String, required: [true, 'Vui lòng nhập email'], trim: true, lowercase: true },
      phone: { type: String, required: [true, 'Vui lòng nhập số điện thoại'], trim: true },
      idCard: { type: String, required: [true, 'Vui lòng nhập CMND/CCCD'], trim: true },
      address: { type: String, required: [true, 'Vui lòng nhập địa chỉ'], trim: true },
    },
    pickupDate: {
      type: Date,
      required: [true, 'Vui lòng chọn ngày nhận xe'],
    },
    returnDate: {
      type: Date,
      required: [true, 'Vui lòng chọn ngày trả xe'],
    },
    totalDays: {
      type: Number,
      required: true,
      min: [1, 'Số ngày thuê tối thiểu là 1 ngày'],
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Vui lòng nhập giá thuê mỗi ngày'],
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    withDriver: {
      type: Boolean,
      default: false,
    },
    deliveryAddress: {
      type: String,
      default: '',
      trim: true,
    },
    pickupLocation: {
      type: String,
      required: [true, 'Vui lòng nhập địa điểm nhận xe'],
      trim: true,
    },
    selectedColor: {
      type: String,
      required: [true, 'Vui lòng chọn màu xe'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
    rentalNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    depositPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentGateway: {
      type: String,
      default: '',
      trim: true,
    },
    voucherCode: {
      type: String,
      trim: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate rentalNumber before saving
RentalSchema.pre('save', function (next) {
  if (!this.rentalNumber) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.rentalNumber = `RENT-${result}`;
  }
  next();
});

// Indexes for common queries
RentalSchema.index({ user: 1, createdAt: -1 });
RentalSchema.index({ status: 1 });

export default mongoose.model<IRental>('Rental', RentalSchema);
