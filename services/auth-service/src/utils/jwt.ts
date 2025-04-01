import jwt, { SignOptions, Secret, JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const accessSecret = process.env.JWT_ACCESS_SECRET as Secret;
const refreshSecret = process.env.JWT_REFRESH_SECRET as Secret;

if (!accessSecret || !refreshSecret) {
  throw new Error('JWT secrets are not defined in environment variables.');
}

const accessTokenOptions: jwt.SignOptions = {
  expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRY || '900', 10), // 15분
};

const refreshTokenOptions: jwt.SignOptions = {
  expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRY || '604800', 10), // 7일
};



export const generateAccessToken = (uuid: string): string => {
  return jwt.sign({ uuid }, accessSecret, accessTokenOptions);
};

export const generateRefreshToken = (uuid: string): string => {
  return jwt.sign({ uuid }, refreshSecret, refreshTokenOptions);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, accessSecret) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, refreshSecret) as JwtPayload;
};

export const decodeJwtPayload = (token: string): any => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(Buffer.from(payload, 'base64').toString());
  } catch {
    return null;
  }
};
