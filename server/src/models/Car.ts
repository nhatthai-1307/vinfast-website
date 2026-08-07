import { Schema, model } from 'mongoose';

const ColorSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true }, // Hex code
  images: [{ type: String, required: true }], // Image URLs for this color
});

const CarSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng cung cấp tên xe'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    price: {
      type: Number,
      required: [true, 'Vui lòng cung cấp giá bán'],
    },
    batteryRentPrice: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: true,
      enum: ['Mini', 'A-SUV', 'B-SUV', 'C-SUV', 'D-SUV', 'E-SUV'],
    },
    seats: {
      type: Number,
      required: true,
    },
    range: {
      type: Number,
      required: true, // Range in km
    },
    power: {
      type: Number, // Horsepower (hp)
    },
    colors: [ColorSchema],
    images360: [{ type: String }], // Array of 24-36 image URLs representing a spin
    specs: {
      engine: { type: String }, // Động cơ
      batteryType: { type: String }, // Loại pin
      batteryCapacity: { type: String }, // Dung lượng pin
      chargingTime: { type: String }, // Thời gian sạc nhanh
      torque: { type: String }, // Mô-men xoắn cực đại
      acceleration: { type: String }, // Khả năng tăng tốc 0-100 km/h
      airbags: { type: Number }, // Số túi khí
      adas: [{ type: String }], // Danh sách tính năng lái thông minh
      dimensions: { type: String }, // Kích thước DxRxC
      groundClearance: { type: String }, // Khoảng sáng gầm xe
    },
    description: {
      type: String,
      default: '',
    },
    videoUrl: {
      type: String,
      default: '',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNewest: {
      type: Boolean,
      default: false,
    },
    stock: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

export const Car = model('Car', CarSchema);
export default Car;
