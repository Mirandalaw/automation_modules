import { Request, Response } from 'express';
import { GradeService } from '../services/grade.service';
import resHandler from '../common/utils/resHandler';
import { HttpStatus } from '../constants/httpStatus';

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
    try {
      const userId = req.user!.id;
      const data = await this.gradeService.getUserGradeInfo(userId as number);
      return resHandler(res, HttpStatus.OK, '등급 조회 성공', data);
    } catch (error: any) {
      return resHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, '등급 조회 실패', null, error.message);
    }
  }
}
