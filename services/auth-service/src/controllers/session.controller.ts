import { Request, Response } from 'express';
import { SessionService } from '../services/session.service';
import { handleControllerError } from '../utils/handleError';
import resHandler from '../utils/resHandler';
import logger from '../utils/logger';

const sessionService = new SessionService();
/**
 * [GET] /sessions
 * - 현재 로그인한 유저의 모든 활성 세션 조회
 */
export const getSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      logger.warn('[GetSessions] 실패: 사용자 ID 없음');
      return resHandler(res, 401, 'Unauthorized: 사용자 ID가 없습니다.');
    }

    const result = await sessionService.getSessionByUser(userId);

    logger.info(`[GetSessions] 성공: userId=${userId}`);
    return resHandler(res, 200, '세션 목록 조회 성공', result.sessions);
  } catch (error) {
    logger.error(`[GetSessions] 에러: ${(error as Error).message}`);
    return handleControllerError(res, error);
  }
};

/**
 * [DELETE] /sessions/:sessionId
 * - 특정 세션 로그아웃 (세션 무효화)
 */
export const deleteSession = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { sessionId } = req.params;

    if (!userId) {
      logger.warn('[DeleteSession] 실패: 사용자 ID 없음');
      return resHandler(res, 401, 'Unauthorized: 사용자 ID가 없습니다.');
    }
    if (!sessionId) {
      logger.warn('[DeleteSession] 실패: 세션 ID 없음');
      return resHandler(res, 400, 'Bad Request: 세션 ID가 필요합니다.');
    }

    const result = await sessionService.invalidateSessionById(userId, sessionId);

    logger.info(`[DeleteSession] 세션 무효화 성공: userId=${userId}, sessionId=${sessionId}`);
    return resHandler(res, 200, result.message);
  } catch (error) {
    logger.error(`[DeleteSession] 에러: ${(error as Error).message}`);
    return handleControllerError(res, error);
  }
};

/**
 * [DELETE] /sessions
 * - 모든 세션 로그아웃 (전체 무효화)
 */
export const deleteAllSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      logger.warn('[DeleteAllSessions] 실패: 사용자 ID 없음');
      return resHandler(res, 401, 'Unauthorized: 사용자 ID가 없습니다.');
    }

    const result = await sessionService.invalidateAllSessions(userId);

    logger.info(`[DeleteAllSessions] 모든 세션 무효화 성공: userId=${userId}`);
    return resHandler(res, 200, result.message);
  } catch (error) {
    logger.error(`[DeleteAllSessions] 에러: ${(error as Error).message}`);
    return handleControllerError(res, error);
  }
};
