import { RegisterUserDto } from '../dtos/RegisterUserDto';
import { User } from '../entities/User';
import { hashPassword } from '../../../utils/hash';
import logger from '../../../utils/logger';

const PRIVACY_AGREEMENT_VALID_DAYS = 365;

/**
 * UserFactory
 * - 회원가입 시 전달받은 DTO로부터 User Entity 생성
 * - 비밀번호 해시 처리 및 약관 동의 처리 포함
 */

export class UserFactory {
  static async createWithHashedPassword(dto: RegisterUserDto): Promise<User> {
    logger.debug(`[UserFactory] User 생성 요청: email=${dto.email}`);
    
    const hashedPassword = await hashPassword(dto.password);

    const user = new User();
    user.name = dto.name;
    user.email = dto.email;
    user.password = hashedPassword;
    user.phone = dto.phone ?? null;
    user.agreedToPrivacyPolicy = dto.agreedToPrivacyPolicy;

    if(dto.agreedToPrivacyPolicy) {
      user.privacyAgreementDate = new Date();
      user.privacyAgreementExpireAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * PRIVACY_AGREEMENT_VALID_DAYS);
    } else {
      user.privacyAgreementDate = null;
      user.privacyAgreementExpireAt = null;
    }

    return user;
  }
}