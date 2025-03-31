import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

export const generateAccessToken = (uuid : string) => {
  return jwt.sign({ uuid }, accessSecret, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  });
};
export const generateRefreshToken = (uuid : string) => {
  return jwt.sign({ uuid }, refreshSecret, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  });
};

export const verifyAccessToken = (token: string) =>{
 return jwt.verify(token, accessSecret);
}
export  const verifyRefreshToken = (token: string) =>{
  return jwt.verify(token, refreshSecret);
}

export const decodeJwtPayload = (token: string): any => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(Buffer.from(payload, 'base64').toString());
  } catch {
    return null;
  }
};