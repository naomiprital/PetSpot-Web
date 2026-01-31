import { Request, Response } from 'express';
import userService from '@/services/userService';
import { AuthRequest } from '@/middlewares/authMiddleware';

const getUserById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = await userService.getUserById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const currentUserId = req.user?._id;

    if (id !== currentUserId) {
      return res
        .status(403)
        .json({ message: 'You can only update your own profile' });
    }

    const updatedUser = await userService.updateUser(id, req.body);
    if (!updatedUser)
      return res.status(404).json({ message: 'User not found' });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default { getUserById, updateUser };
