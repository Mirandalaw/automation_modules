import { AppDataSource } from '../configs/data-source';
import { Session } from '../entities/Session';
import logger from '../utils/logger';
import { CustomError } from '../utils/CustomError';
import { deleteRefreshToken } from '../utils/redis';

/**
 * 현재 유저의 모든 유효한 세션 조회
 * @param userId - 사용자 UUID
 * @returns 세션 리스트
 */
export const getUserSessionsByUser = async (userId: string) => {
  const sessionRepository = AppDataSource.getRepository(Session);

  logger.info(`[SessionService] 세션 목록 조회 요청: userId=${userId}`);

  try {
    const sessions = await sessionRepository.find({
      where: { user: { uuid: userId }, isValid: true },
      order: { createdAt: 'DESC' },
      select: ['id', 'userAgent', 'ipAddress', 'createdAt', 'expiredAt'],
    });

    logger.info(`[SessionService] 세션 목록 조회 성공: userId=${userId}, count=${sessions.length}`);
    return {
      success: true,
      sessions,
    };
  } catch (error) {
    logger.error(`[SessionService] 세션 목록 조회 실패: ${(error as Error).message}`);
    throw new CustomError(500, '세션 목록 조회 중 서버 오류 발생');
  }
};

/**
 * 특정 세션 하나만 무효화 (로그아웃)
 * @param userId - 요청자 UUID
 * @param sessionId - 무효화할 세션 ID
 * @returns 성공 메시지
 */
export const invalidateSessionById = async (userId: string, sessionId: string) => {
  const sessionRepository = AppDataSource.getRepository(Session);

  logger.info(`[SessionService] 세션 무효화 요청: userId=${userId}, sessionId=${sessionId}`);

  try {
    const session = await sessionRepository.findOne({
      where: { id: sessionId, user: { uuid: userId }, isValid: true },
    });

    if (!session) {
      logger.warn(`[SessionService] 세션 없음 또는 무효 상태: sessionId=${sessionId}`);
      throw new CustomError(404, '존재하지 않거나 이미 무효화된 세션입니다.');
    }

    session.isValid = false;
    await sessionRepository.save(session);

    // Redis RefreshToken 삭제
    await deleteRefreshToken(userId);
    logger.info(`[SessionService] 세션 무효화 및 RefreshToken 삭제 완료: userId=${userId}, sessionId=${sessionId}`);

    return {
      success: true,
      message: '세션이 정상적으로 로그아웃되었습니다.',
    };
  } catch (error) {
    logger.error(`[SessionService] 세션 무효화 실패: ${(error as Error).message}`);
    throw new CustomError(500, '세션 무효화 중 서버 오류 발생');
  }
};

/**
 * 현재 사용자 모든 세션 무효화 (전체 로그아웃)
 * @param userId - 사용자 UUID
 * @returns 성공 메시지
 */
export const invalidateAllSessions = async (userId: string) => {
  const sessionRepository = AppDataSource.getRepository(Session);

  logger.info(`[SessionService] 전체 세션 무효화 요청: userId=${userId}`);

  try {
    await sessionRepository.update(
      { user: { uuid: userId }, isValid: true },
      { isValid: false },
    );

    await deleteRefreshToken(userId);

    logger.info(`[SessionService] 전체 세션 무효화 및 RefreshToken 삭제 완료: userId=${userId}`);
    return {
      success: true,
      message: '모든 세션이 성공적으로 로그아웃되었습니다.',
    };
  } catch (error) {
    logger.error(`[SessionService] 전체 세션 무효화 실패: ${(error as Error).message}`);
    throw new CustomError(500, '모든 세션 무효화 중 서버 오류 발생');
  }
};
