/**
 * @swagger
 * components:
 *   schemas:
 *     FindEmailDto:
 *       type: object
 *       required:
 *         - name
 *         - phone
 *       properties:
 *         name:
 *           type: string
 *           example: 홍길동
 *         phone:
 *           type: string
 *           pattern: ^010-\\d{4}-\\d{4}$
 *           example: 010-1234-5678
 */

import { IsNotEmpty, Matches } from 'class-validator';

export class FindEmailDto {
  @IsNotEmpty({ message: '이름은 필수입니다.' })
  name: string;

  @Matches(/^010-\d{4}-\d{4}$/, {
    message: '휴대폰 번호는 010-XXXX-XXXX 형식이어야 합니다.',
  })
  phone: string;
}
