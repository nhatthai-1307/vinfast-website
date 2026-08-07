import { Schema, model } from 'mongoose';

const ReviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    car: {
      type: Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    images: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export const Review = model('Review', ReviewSchema);
export default Review;
