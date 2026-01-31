import UserModel from '../models/userModel';
import { User } from '@/types/user';

const getUserById = async (id: string) => {
  return await UserModel.findById(id).select('-password -refreshToken');
};

const updateUser = async (id: string, userData: Partial<User>) => {
  const { password, ...updateData } = userData;

  return await UserModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).select('-password -refreshToken');
};

export default { getUserById, updateUser };
