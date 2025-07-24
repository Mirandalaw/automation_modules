// src/controllers/UserMeController.ts
import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import resHandler from '../common/utils/resHandler';
import { HttpStatus } from '../constants/httpStatus';
import logger from '../common/logger';

/**
 * UserMeController
 * - 현재 로그인된 사용자 정보 조회
 */
export class UserMeController {
  constructor(private readonly userService: UserService) {}

  async handle(req: Request, res: Response) {
    try {
      const userId = Number(req.user!.id);
      logger.debug(`[UserMeController] /users/me 요청: userId=${userId}`);

      const data = await this.userService.getMyProfile(userId);

      logger.info(`[UserMeController] 내 정보 조회 성공: userId=${userId}`);
      return resHandler(res, HttpStatus.OK, '내 정보 조회 성공', data);
    } catch (error: any) {
      logger.error(`[UserMeController] 내 정보 조회 실패: ${error.message}`);
      return resHandler(
        res,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || '내 정보 조회 실패',
        null,
        error.stack,
      );
    }
  }
}
