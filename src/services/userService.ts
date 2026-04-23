import UserModel from '../models/userModel';
import { User } from '@/types/user';

const getUserById = async (id: string) => {
  return await UserModel.findById(id).select('-password -refreshToken');
};

type UpdateUserPayload = Pick<
  User,
  'firstName' | 'lastName' | 'phoneNumber' | 'imageUrl'
>;

const updateUser = async (id: string, updateData: UpdateUserPayload) => {
  return await UserModel.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select('-password -refreshToken');
};

export default { getUserById, updateUser };
