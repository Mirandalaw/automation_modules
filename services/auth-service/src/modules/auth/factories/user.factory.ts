import { RegisterUserDto } from '../../../dto/RegisterUserDto';
import { User } from '../../../entities/User';
import { hashPassword } from '../../../utils/hash';
import logger from '../../../utils/logger';

/**
 * UserFactory => User Entity 생성을 담당하는 클래스
 * - 비밀번호는 해시 처리
 * - 개인정보 수집 동의 여부에 따라 유효기간 및 날짜 설정
 */

export class UserFactory {
  static async createFromRegisterDto(dto: RegisterUserDto): Promise<User> {
    logger.debug(`[UserFactory] User 생성 요청: email=${dto.email}`);
    
    const hashedPassword = await hashPassword(dto.password);

    const user = new User();
    user.name = dto.name;
    user.email = dto.email;
    user.password = hashedPassword;
    user.phone = dto.phone;
    user.agreedToPrivacyPolicy = dto.agreedToPrivacyPolicy;
    user.privacyAgreementDate = dto.agreedToPrivacyPolicy ? new Date() : null;
    user.privacyAgreementExpireAt = dto.agreedToPrivacyPolicy
      ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 365)
      : null;


    return user;

    // return {
    //   ...dto,
    //   password : hashedPassword,
    //   privacyAgreementDate:dto.agreedToPrivacyPolicy?new Date():null,
    //   privacyAgreementExpireAt : dto.agreedToPrivacyPolicy ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 365) : null,
    // } as User;
  }
}