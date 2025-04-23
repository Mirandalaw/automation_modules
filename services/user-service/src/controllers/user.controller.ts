import { Request, Response } from 'express';
import { getUserProfile } from '../services/user.service';
import logger from '../utils/logger';
import { handleControllerError } from '../utils/handleError';

export const getMyPage = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId || typeof userId !== 'string') {
      logger.warn('[GetMyPage] 사용자 ID 누락 또는 타입 오류');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    logger.info(`[GetMyPage] 요청 수신 - userId=${userId}`);

    const result = await getUserProfile(userId);

    logger.info(`[GetMyPage] 마이페이지 조회 성공 - userId=${userId}`);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    logger.error(`[GetMyPage] 마이페이지 조회 실패 - ${(error as Error).message}`);
    return handleControllerError(res, error);
  }
};