import { Request, Response } from 'express';
import authService from '../services/authService';

const register = async (req: Request, res: Response) => {
  try {
    let imageUrl = '/images/default-user-avatar.png';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const newUser = await authService.register({
      ...req.body,
      imageUrl,
    });

    res.status(201).json(newUser);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const user = await authService.login(req.body);
    res.status(200).json(user);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

const googleLogin = async (req: Request, res: Response) => {
  try {
    // Note: In a production app, you would verify a Google Token here first.
    // Assuming your frontend has already verified the user and is sending the profile data:
    const { email, firstName, lastName, imageUrl } = req.body;

    if (!email || !firstName) {
      return res
        .status(400)
        .json({ error: 'Missing required Google profile data' });
    }

    const user = await authService.googleLogin(
      email,
      firstName,
      lastName,
      imageUrl || ''
    );
    res.status(200).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res
        .status(400)
        .json({ error: 'Refresh token is required for logout' });
    }

    await authService.logout(refreshToken);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const tokens = await authService.refresh(refreshToken);
    res.status(200).json(tokens);
  } catch (error: any) {
    res.status(403).json({ error: error.message });
  }
};

export default { register, login, googleLogin, logout, refresh };
