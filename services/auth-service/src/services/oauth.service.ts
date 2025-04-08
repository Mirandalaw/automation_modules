import { Profile } from 'passport-google-oauth20';
import { AppDataSource } from '../configs/data-source';
import { User } from '../entities/User';
import { UserSocialAccount } from '../entities/UserSocialAccount';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { saveRefreshToken } from '../utils/redis';
import logger from '../utils/logger';
import { CustomError } from '../utils/CustomError';

/**
 * ✅ Google OAuth 프로필을 기반으로 사용자 조회 또는 생성
 * - 이미 연동된 소셜 계정이 있다면 기존 유저 반환
 * - 없으면 User 및 UserSocialAccount 새로 생성
 *
 * @param profile Google OAuth 인증 후 받은 사용자 정보
 * @returns User 엔티티 인스턴스
 */
export const findOrCreateUser = async (profile: Profile): Promise<User> => {
  const userRepo = AppDataSource.getRepository(User);
  const socialRepo = AppDataSource.getRepository(UserSocialAccount);

  const provider = 'google';
  const providerId = profile.id;
  const email = profile.emails?.[0]?.value;
  const displayName = profile.displayName;

  try {
    logger.debug(`[OAuth] 받은 프로필 - provider=${provider}, id=${providerId}, email=${email}`);

    // 1. 기존에 연동된 소셜 계정이 있는지 확인
    const existingSocial = await socialRepo.findOne({
      where: { provider, providerId },
      relations: ['user'],
    });

    if (existingSocial) {
      logger.info(`[OAuth] 기존 소셜 계정 로그인: user=${existingSocial.user.email}`);
      return existingSocial.user;
    }

    // 2. 새로운 사용자 생성
    const newUser = userRepo.create({
      name: displayName,
      email,
    });
    await userRepo.save(newUser);
    logger.info(`[OAuth] 새 사용자 생성: email=${newUser.email}`);

    // 3. 소셜 계정 연결 정보 저장
    const newSocial = socialRepo.create({
      provider,
      providerId,
      email,
      user: newUser,
    });
    await socialRepo.save(newSocial);
    logger.info(`[OAuth] 소셜 계정 연결 완료: provider=${provider}, id=${providerId}`);

    return newUser;
  } catch (err: any) {
    logger.error(`[OAuth] 사용자 생성 또는 조회 실패: ${err.message}`);
    throw new CustomError(500, '소셜 로그인 처리 중 오류 발생', err.message);
  }
};

/**
 * ✅ OAuth 로그인 후 AccessToken / RefreshToken 발급 및 Redis 저장
 *
 * @param user 로그인된 사용자 엔티티
 * @returns 토큰 객체 { accessToken, refreshToken }
 */
export const handleOAuthLogin = async (user: User) => {
  try {
    const accessToken = generateAccessToken(user.uuid);
    const refreshToken = generateRefreshToken(user.uuid);

    await saveRefreshToken(user.uuid, refreshToken);
    logger.info(`[OAuth] 토큰 발급 및 저장 완료: userId=${user.uuid}`);

    return {
      accessToken,
      refreshToken,
    };
  } catch (err: any) {
    logger.error(`[OAuth] 토큰 처리 실패: ${err.message}`);
    throw new CustomError(500, '토큰 처리 중 오류 발생', err.message);
  }
};
