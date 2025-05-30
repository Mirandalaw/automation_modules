/**
 * @swagger
 * components:
 *   schemas:
 *     VerifyResetCodeDto:
 *       type: object
 *       required:
 *         - email
 *         - code
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: 인증 코드를 받을 때 사용한 이메일
 *           example: user@example.com
 *         code:
 *           type: string
 *           description: 발송된 인증 코드
 *           example: 123456
 */
import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyResetCodeDto {
  @IsEmail({}, { message: '이메일 형식이 아닙니다.' })
  email: string;

  @IsNotEmpty({ message: '인증 코드는 필수입니다.' })
  code: string;
}
