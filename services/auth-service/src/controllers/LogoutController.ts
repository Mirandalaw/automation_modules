import { Request, Response } from 'express';
import { LogoutUserUsecase } from '../use-cases/LogoutUserUsecase';
import { LogoutUserDto } from '../dtos/LogoutUserDto';
import resHandler from '../common/utils/resHandler';
import { HttpStatus } from '../constants/httpStatus';

/**
 * LogoutController
 * - 로그아웃 요청 처리 (POST /auth/logout)
 */
export class LogoutController {
  constructor(private readonly logoutUserUsecase: LogoutUserUsecase) {}

  async handle(req: Request, res: Response) {
    try {
      const dto = req.body as LogoutUserDto;

      const result = await this.logoutUserUsecase.execute(dto);
      return resHandler(res, HttpStatus.OK, '로그아웃 성공', result);
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      return resHandler(res, status, error.message, null, error.stack);
    }
  }
}
