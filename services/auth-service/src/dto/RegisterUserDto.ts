import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';

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
}
