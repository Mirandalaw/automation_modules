/**
 * @swagger
 * components:
 *   schemas:
 *     ReissueTokenDto:
 *       type: object
 *       required:
 *         - refreshToken
 *         - userAgent
 *         - ip
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: 유효한 RefreshToken 문자열
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         userAgent:
 *           type: string
 *           description: 클라이언트의 User-Agent
 *           example: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
 *         ip:
 *           type: string
 *           description: 클라이언트의 IP 주소
 *           example: 127.0.0.1
 */
import { IsNotEmpty } from 'class-validator';

export class ReissueTokenDto {
  @IsNotEmpty({ message: 'RefreshToken은 필수입니다.' })
  refreshToken: string;

  @IsNotEmpty({ message: 'User-Agent는 필수입니다.' })
  userAgent: string;

  @IsNotEmpty({ message: 'IP 주소는 필수입니다.' })
  ip: string;
}