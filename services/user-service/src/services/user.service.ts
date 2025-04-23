import { AppDataSource } from '../configs/data-source';
import { User } from '../entities/User';
import { UserSocialAccount } from '../entities/UserSocialAccount';
import logger from '../utils/logger';
import { CustomError } from '../utils/CustomError';

export const getUserProfile = async (userId: string) => {
  const userRepo = AppDataSource.getRepository(User);
  const socialRepo = AppDataSource.getRepository(UserSocialAccount);

  const user = await userRepo.findOne({ where: { uuid: userId } });
  if (!user) {
    logger.warn(`[GetUserProfile] 사용자 없음: ${userId}`);
    throw new CustomError(404, 'User not found');
  }

  const socials = await socialRepo.find({ where: { user: { uuid: userId } } });

  return {
    uuid: user.uuid,
    name: user.name,
    email: user.email,
    phone: user.phone,
    agreedToPrivacyPolicy: user.agreedToPrivacyPolicy,
    privacyAgreementDate: user.privacyAgreementDate,
    privacyAgreementExpireAt: user.privacyAgreementExpireAt,
    createdAt: user.createdAt,
    socialAccounts: socials.map(s => s.provider),
  };
};
