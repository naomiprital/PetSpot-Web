import { Request, Response } from 'express';
import userService from '../services/userService';
import { AuthRequest } from '@/middlewares/authMiddleware';

const getUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(req.params.id as string);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;
    const requestingUserId = req.user?._id;

    if (userId !== requestingUserId) {
      return res
        .status(403)
        .json({ error: 'You can only update your own profile' });
    }

    const updateData = { ...req.body };

    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await userService.updateUser(
      userId as string,
      updateData
    );
    res.json(updatedUser);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
export default { getUser, updateUser };
