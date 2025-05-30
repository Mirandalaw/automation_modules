import { Request, Response } from 'express';
import { SendResetCodeUsecase } from '../use-cases/SendReseCodeUsecase';
import { SendResetCodeDto } from '../dtos/SendResetCodeDto';
import resHandler from '../common/utils/resHandler';
import { HttpStatus } from '../constants/httpStatus';

/**
 * SendResetCodeController
 * - 비밀번호 재설정 코드 전송 (POST /auth/reset-code)
 */
export class SendResetCodeController {
  constructor(private readonly sendResetCodeUsecase: SendResetCodeUsecase) {}

  async handle(req: Request, res: Response) {
    try {
      const dto = req.body as SendResetCodeDto;

      const result = await this.sendResetCodeUsecase.execute(dto);
      return resHandler(res, HttpStatus.OK, '인증 코드 전송 성공', result);
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      return resHandler(res, status, error.message, null, error.stack);
    }
  }
}
