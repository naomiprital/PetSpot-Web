import { Request, Response } from 'express';
import authService from '../services/authService';

const MAX_AGE_REFRESH_TOKEN_COOKIE = 7 * 24 * 60 * 60 * 1000;
const MAX_AGE_ACCESS_TOKEN_COOKIE = 15 * 60 * 1000;

const setCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  const isProd = process.env.NODE_ENV === 'production'; // todo: Add to prod env

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: MAX_AGE_ACCESS_TOKEN_COOKIE,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: MAX_AGE_REFRESH_TOKEN_COOKIE,
  });
};

const register = async (req: Request, res: Response) => {
  try {
    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : '/images/default-user-avatar.jpg';

    const { accessToken, refreshToken, user } = await authService.register({
      ...req.body,
      imageUrl,
    });

    setCookies(res, accessToken, refreshToken);

    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { accessToken, refreshToken, ...user } = await authService.login(
      req.body
    );

    setCookies(res, accessToken, refreshToken);

    res.status(200).json(user);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

const googleLogin = async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName, phoneNumber, imageUrl } = req.body;

    if (!email || !firstName) {
      return res
        .status(400)
        .json({ error: 'Missing required Google profile data' });
    }

    const { accessToken, refreshToken, ...user } =
      await authService.googleLogin(
        email,
        firstName,
        lastName,
        phoneNumber,
        imageUrl || '/images/default-user-avatar.jpg'
      );

    setCookies(res, accessToken, refreshToken);

    res.status(200).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

const refresh = async (req: Request, res: Response) => {
  try {
    const oldRefreshToken = req.cookies?.refreshToken;

    if (!oldRefreshToken) {
      return res
        .status(401)
        .json({ error: 'No refresh token found in cookies' });
    }

    const tokens = await authService.refresh(oldRefreshToken);

    setCookies(res, tokens.accessToken, tokens.refreshToken);

    res.status(200).json({ message: 'Tokens refreshed successfully' });
  } catch (error: any) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(403).json({ error: error.message });
  }
};

export default { register, login, googleLogin, logout, refresh };
