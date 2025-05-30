import { Request, Response } from 'express';
import { VerifyResetCodeUsecase } from '../use-cases/VerfyResetCodeUsecase';
import { VerifyResetCodeDto } from '../dtos/VerifyResetCodeDto';
import resHandler from '../common/utils/resHandler';
import { HttpStatus } from '../constants/httpStatus';

/**
 * VerifyResetCodeController
 * - 인증 코드 검증 (POST /auth/verify-code)
 */
export class VerifyResetCodeController {
  constructor(private readonly verifyResetCodeUsecase: VerifyResetCodeUsecase) {}

  async handle(req: Request, res: Response) {
    try {
      const dto = req.body as VerifyResetCodeDto;

      const result = await this.verifyResetCodeUsecase.execute(dto);
      return resHandler(res, HttpStatus.OK, '인증 코드 검증 성공', result);
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      return resHandler(res, status, error.message, null, error.stack);
    }
  }
}
