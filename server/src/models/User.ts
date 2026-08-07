import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface để TypeScript biết các method của User document
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'staff' | 'customer';
  phone: string;
  avatar: string;
  favorites: any[];
  refreshToken: string;
  isEmailConfirmed: boolean;
  otpCode?: string;
  otpExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng cung cấp tên'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Vui lòng cung cấp email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Vui lòng cung cấp email hợp lệ',
      ],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Vui lòng cung cấp mật khẩu'],
      minlength: [6, 'Mật khẩu phải từ 6 ký tự'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['admin', 'staff', 'customer'],
      default: 'customer',
    },
    phone: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    favorites: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Car',
      },
    ],
    refreshToken: {
      type: String,
      default: '',
    },
    isEmailConfirmed: {
      type: Boolean,
      default: false,
    },
    otpCode: {
      type: String,
      default: '',
    },
    otpExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = model<IUser>('User', UserSchema);
export default User;
