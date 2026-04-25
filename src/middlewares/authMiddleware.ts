import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { _id: string };
}

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).send({ error: 'Access Denied' });
  }

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET as string) as {
      _id: string;
    };
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).send({ error: 'Invalid Token' });
  }
};

export default authMiddleware;
