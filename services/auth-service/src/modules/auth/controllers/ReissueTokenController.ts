import { Request, Response } from 'express';
import { ReissueTokenUsecase } from '../use-cases/ReissueTokenUsecase';
import { ReissueTokenDto } from '../dtos/ReissueTokenDto';
import resHandler from '../../../utils/resHandler';
import { HttpStatus } from '../../../constants/httpStatus';

/**
 * ReissueTokenController
 * - 토큰 재발급 요청 처리 (POST /auth/reissue)
 */
export class ReissueTokenController {
  constructor(private readonly reissueTokenUsecase: ReissueTokenUsecase) {}

  async handle(req: Request, res: Response) {
    try {
      const dto = req.body as ReissueTokenDto;

      const result = await this.reissueTokenUsecase.execute(dto);
      return resHandler(res, HttpStatus.OK, '토큰 재발급 성공', result);
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      return resHandler(res, status, error.message, null, error.stack);
    }
  }
}
