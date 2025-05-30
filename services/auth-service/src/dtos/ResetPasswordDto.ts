/**
 * @swagger
 * components:
 *   schemas:
 *     ResetPasswordDto:
 *       type: object
 *       required:
 *         - email
 *         - code
 *         - newPassword
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: 비밀번호를 변경할 사용자 이메일
 *           example: user@example.com
 *         code:
 *           type: string
 *           description: 이메일로 발송된 인증 코드
 *           example: 654321
 *         newPassword:
 *           type: string
 *           description: 새 비밀번호
 *           minLength: 6
 *           maxLength: 20
 *           example: NewSecure123!
 */
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail({}, { message: '이메일 형식이 아닙니다.' })
  email: string;

  @IsNotEmpty({ message: '인증 코드는 필수입니다.' })
  code: string;

  @Length(6, 20, { message: '비밀번호는 6자 이상 20자 이하이어야 합니다.' })
  newPassword: string;
}
