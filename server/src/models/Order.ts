import { Schema, model } from 'mongoose';

const OrderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Allow guest order (optional)
    },
    customerInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      idCard: { type: String, required: true }, // CMND/CCCD để làm thủ tục
    },
    car: {
      type: Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
    },
    selectedColor: {
      type: String,
      required: true,
    },
    purchaseOption: {
      type: String,
      enum: ['buy-battery', 'rent-battery'],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['full-payment', 'installment'],
      required: true,
    },
    installmentDetails: {
      prepaidAmount: { type: Number }, // Số tiền trả trước
      months: { type: Number }, // Số tháng vay
      bank: { type: String }, // Ngân hàng liên kết
      monthlyPayment: { type: Number }, // Tiền trả hàng tháng ước tính
    },
    depositAmount: {
      type: Number,
      default: 10000000, // Tiền cọc tối thiểu là 10,000,000đ
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'],
      default: 'pending',
    },
    showroom: {
      type: String,
      required: true, // Showroom nhận xe
    },
  },
  {
    timestamps: true,
  }
);

export const Order = model('Order', OrderSchema);
export default Order;
