import { Schema, model } from 'mongoose';

const TestDriveSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    customerInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    car: {
      type: Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true, // e.g., "08:00 - 10:00", "10:00 - 12:00"
    },
    showroom: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'completed', 'cancelled'],
      default: 'pending',
    },
    assignedStaff: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const TestDrive = model('TestDrive', TestDriveSchema);
export default TestDrive;
