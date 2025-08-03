import { Request, Response } from 'express';
import { GradeService } from '../services/GradeService';
import resHandler from '../common/utils/resHandler';
import { HttpStatus } from '../constants/httpStatus';
import logger from '../common/logger';

/**
 * UserGradeController
 * - 사용자의 등급 및 다음 조건 조회 API 처리
 */
export class UserGradeController {
  constructor(private readonly gradeService: GradeService) {}

  /**
   * GET /users/me/grade
   * - 현재 로그인된 사용자의 등급/레벨/경험치 및 다음 등급 조건 반환
   */
  async handle(req: Request, res: Response) {
    const userUUID = req.user?.uuid;

    logger.debug(`[UserGradeController] 사용자 정보: ${JSON.stringify(req.user)}`);

    if (!userUUID) {
      logger.warn(`[UserGradeController] 요청에 사용자 UUID 없음`);
      return resHandler(res, HttpStatus.BAD_REQUEST, '사용자 정보 없음');
    }

    try {
      const data = await this.gradeService.getUserGradeInfo(userUUID);
      return resHandler(res, HttpStatus.OK, '등급 조회 성공', data);
    } catch (error: any) {
      logger.error(`[UserGradeController] 등급 조회 실패: ${error.message}`);
      return resHandler(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        '등급 조회 실패',
        null,
        error.message,
      );
    }
  }
}
