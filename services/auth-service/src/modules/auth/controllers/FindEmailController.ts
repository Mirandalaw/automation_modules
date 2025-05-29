import { Request, Response } from 'express';
import { FindEmailUsecase } from '../use-cases/FindEmailUsecase';
import { FindEmailDto } from '../dtos/FindEmailDto';
import resHandler from '../../../utils/resHandler';
import { HttpStatus } from '../../../constants/httpStatus';

/**
 * FindEmailController
 * - 이메일 찾기 요청 처리 (POST /auth/find-email)
 */
export class FindEmailController {
  constructor(private readonly findEmailUsecase: FindEmailUsecase) {}

  async handle(req: Request, res: Response) {
    try {
      const dto = req.body as FindEmailDto;

      const result = await this.findEmailUsecase.execute(dto);
      return resHandler(res, HttpStatus.OK, '이메일 조회 성공', result);
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      return resHandler(res, status, error.message, null, error.stack);
    }
  }
}
