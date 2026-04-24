import { Request, Response } from 'express';
import authService from '../services/authService';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';

const client = new OAuth2Client();

async function downloadGoogleImage(pictureUrl: string): Promise<string> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const extension = path.extname(new URL(pictureUrl).pathname) || '.jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`;
  const destPath = path.join(uploadsDir, filename);

  await new Promise<void>((resolve, reject) => {
    const clientLib = pictureUrl.startsWith('https') ? https : http;
    clientLib
      .get(pictureUrl, resp => {
        if (resp.statusCode && resp.statusCode >= 400)
          return reject(
            new Error(`Failed to download image, status ${resp.statusCode}`)
          );
        const fileStream = fs.createWriteStream(destPath);
        resp.pipe(fileStream);
        fileStream.on('finish', () => fileStream.close(() => resolve()));
        fileStream.on('error', err => reject(err));
      })
      .on('error', err => reject(err));
  });

  return `/uploads/${filename}`;
}

const register = async (req: Request, res: Response) => {
  try {
    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : '/images/default-user-avatar.jpg';

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
    const ticket = await client.verifyIdToken({
      idToken: req.body.credentials.credential,
      audience: process.env.WEB_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email;
    if (!email) {
      return res.status(400).json({ error: 'Google token missing email' });
    }

    let imageUrl = '/images/default-user-avatar.jpg';
    const pictureUrl = payload?.picture;
    if (pictureUrl && typeof pictureUrl === 'string') {
      try {
        imageUrl = await downloadGoogleImage(pictureUrl);
      } catch (err) {
        console.error('Failed to download Google profile picture:', err);
        imageUrl = '/images/default-user-avatar.jpg';
      }
    }

    const user = await authService.googleLogin(
      email,
      payload?.given_name || 'Google',
      payload?.family_name || 'User',
      req.body.phoneNumber, // Google doesn't provide phone number in the token
      imageUrl
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
