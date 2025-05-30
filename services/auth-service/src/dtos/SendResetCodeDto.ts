/**
 * @swagger
 * components:
 *   schemas:
 *     SendResetCodeDto:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: 비밀번호 초기화 대상 이메일
 *           example: user@example.com
 */
import { IsEmail } from 'class-validator';

export class SendResetCodeDto {
  @IsEmail({}, { message: '이메일 형식이 아닙니다.' })
  email: string;
}
