/**
 * @swagger
 * components:
 *   schemas:
 *     LoginUserDto:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - userAgent
 *         - ip
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         password:
 *           type: string
 *           example: securePassword1!
 *         userAgent:
 *           type: string
 *           example: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
 *         ip:
 *           type: string
 *           example: 127.0.0.1
 */

import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, { message: '이메일 형식이 아닙니다.' })
  email: string;

  @IsNotEmpty({ message: '비밀번호는 필수입니다.' })
  password: string;

  @IsNotEmpty({ message: 'User-Agent는 필수입니다.' })
  userAgent: string;

  @IsNotEmpty({ message: 'IP 주소는 필수입니다.' })
  ip: string;
}