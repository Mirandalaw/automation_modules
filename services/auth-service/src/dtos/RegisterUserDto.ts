/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterUserDto:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - phone
 *         - agreedToPrivacyPolicy
 *       properties:
 *         name:
 *           type: string
 *           description: 사용자 이름
 *           example: 홍길동
 *         email:
 *           type: string
 *           format: email
 *           description: 이메일 주소
 *           example: test@example.com
 *         password:
 *           type: string
 *           minLength: 6
 *           maxLength: 20
 *           description: 비밀번호 (6~20자)
 *           example: myPassword123
 *         phone:
 *           type: string
 *           pattern: '^010-\\d{4}-\\d{4}$'
 *           description: 휴대폰 번호
 *           example: 010-1234-5678
 *         agreedToPrivacyPolicy:
 *           type: boolean
 *           description: 개인정보 수집 동의
 *           example: true
 */

import { IsEmail, IsNotEmpty, Length, Matches, IsBoolean, Equals } from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty({ message: '이름은 필수입니다.' })
  name: string;

  @IsEmail({}, { message: '이메일 형식이 아닙니다.' })
  email: string;

  @Length(6, 20, { message: '비밀번호는 6자 이상 20자 이하여야 합니다.' })
  password: string;

  @Matches(/^010-\d{4}-\d{4}$/, {
    message: '휴대폰 번호는 010-XXXX-XXXX 형식이어야 합니다.',
  })
  phone: string;

  @IsBoolean()
  @Equals(true, { message: '개인정보 수집 및 이용 동의는 필수입니다.' })
  agreedToPrivacyPolicy: boolean;
}
