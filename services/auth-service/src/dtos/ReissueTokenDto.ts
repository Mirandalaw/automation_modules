/**
 * @swagger
 * components:
 *   schemas:
 *     ReissueTokenDto:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: 유효한 RefreshToken 문자열
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */

import { IsNotEmpty } from 'class-validator';

export class ReissueTokenDto {
  @IsNotEmpty({ message: 'RefreshToken은 필수입니다.' })
  refreshToken: string;
}