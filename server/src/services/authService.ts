import UserModel from '../models/userModel';
import { User as UserType } from '@/types/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { _id: userId },
    process.env.TOKEN_SECRET as string,
    { expiresIn: process.env.TOKEN_EXPIRATION } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    { _id: userId },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION } as jwt.SignOptions
  );

  return { accessToken, refreshToken };
};

const register = async (user: UserType) => {
  const { email, password, username } = user;

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await UserModel.create({
    email,
    password: hashedPassword,
    username,
  });

  return newUser;
};

const login = async (user: UserType) => {
  const { email, password } = user;

  if (!email || !password) throw new Error('Email and password are required');

  const foundUser = await UserModel.findOne({ email }).select('+password');

  if (!foundUser) throw new Error('Invalid email or password');

  const isMatch = await bcrypt.compare(password, foundUser.password);
  if (!isMatch) throw new Error('Invalid email or password');

  const tokens = generateTokens(foundUser._id.toString());

  if (!foundUser.refreshToken) foundUser.refreshToken = [];
  foundUser.refreshToken.push(tokens.refreshToken);
  await foundUser.save();

  return { ...tokens, _id: foundUser._id };
};

const logout = async (refreshToken: string) => {
  const user = await UserModel.findOne({ refreshToken: refreshToken });
  if (!user) return;

  user.refreshToken = user.refreshToken.filter(t => t !== refreshToken);
  await user.save();
};

const refresh = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { _id: string };

    const user = await UserModel.findById(decoded._id);
    if (!user) throw new Error('User not found');

    if (!user.refreshToken.includes(refreshToken)) {
      user.refreshToken = [];
      await user.save();
      throw new Error('Invalid Refresh Token');
    }

    const tokens = generateTokens(user._id.toString());

    user.refreshToken = user.refreshToken.filter(t => t !== refreshToken);
    user.refreshToken.push(tokens.refreshToken);
    await user.save();

    return tokens;
  } catch (err) {
    throw new Error('Invalid Refresh Token');
  }
};

export default { register, login, logout, refresh };
