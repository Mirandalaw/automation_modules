import { Request, Response } from 'express';
import { ResetPasswordUsecase } from '../use-cases/ResetPasswordUsecase';
import { ResetPasswordDto } from '../dtos/ResetPasswordDto';
import resHandler from '../../../utils/resHandler';
import { HttpStatus } from '../../../constants/httpStatus';

/**
 * ResetPasswordController
 * - 비밀번호 재설정 (POST /auth/reset-password)
 */
export class ResetPasswordController {
  constructor(private readonly resetPasswordUsecase: ResetPasswordUsecase) {}

  async handle(req: Request, res: Response) {
    try {
      const dto = req.body as ResetPasswordDto;

      const result = await this.resetPasswordUsecase.execute(dto);
      return resHandler(res, HttpStatus.OK, '비밀번호 재설정 성공', result);
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      return resHandler(res, status, error.message, null, error.stack);
    }
  }
}
