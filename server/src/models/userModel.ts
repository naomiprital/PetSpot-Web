import { User } from '@/types/user';
import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema<User>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
    },
    photo: {
      type: String,
      default: '/images/default-user-avatar.png',
    },
    refreshToken: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
