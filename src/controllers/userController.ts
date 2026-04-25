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
    if (req.params.id !== req.user?._id) {
      return res
        .status(403)
        .json({ error: 'Forbidden: You can only edit your own profile' });
    }

    const updateData = { ...req.body };

    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await userService.updateUser(
      req.params.id as string,
      updateData
    );
    res.json(updatedUser);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
export default { getUser, updateUser };
