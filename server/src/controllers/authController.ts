import { Request, Response } from 'express';
import authService from '../services/authService';

const register = async (req: Request, res: Response) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (err) {
    res
      .status(400)
      .json({ error: err instanceof Error ? err.message : 'Error' });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const tokens = await authService.login(req.body);
    res.status(200).json({
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      _id: tokens._id,
    });
  } catch (err) {
    res
      .status(400)
      .json({ error: err instanceof Error ? err.message : 'Error' });
  }
};

const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ error: 'Refresh Token Required' });

    await authService.logout(refreshToken);
    res.status(200).send('Logged out successfully');
  } catch (err) {
    res
      .status(400)
      .json({ error: err instanceof Error ? err.message : 'Error' });
  }
};

const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ error: 'Refresh Token Required' });

    const tokens = await authService.refresh(refreshToken);

    res.status(200).json({
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (err) {
    res
      .status(401)
      .json({ error: err instanceof Error ? err.message : 'Error' });
  }
};

export default { register, login, logout, refresh };
