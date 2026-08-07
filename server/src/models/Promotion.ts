import { Schema, model } from 'mongoose';

const PromotionSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountAmount: {
      type: Number, // Absolute discount amount (e.g. 5,000,000đ)
      default: 0,
    },
    discountPercentage: {
      type: Number, // Percentage discount (e.g. 5%)
      default: 0,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Promotion = model('Promotion', PromotionSchema);
export default Promotion;
