import { IResetCodeRepository } from '../repositories/interfaces/IResetCodeRepository';
import { CustomError } from '../../../utils/CustomError';
import { HttpStatus } from '../../../constants/httpStatus';
import { MessageResponse } from '../types/responseTypes';
import logger from '../../../utils/logger';
import { VerifyResetCodeDto } from '../dtos/VerifyResetCodeDto';

/**
 * VerifyResetCodeUsecase
 * - 사용자가 제출한 이메일 + 인증코드를 Redis에서 검증
 * - 올바른 코드일 경우 OK, 틀릴 경우 예외
 */
export class VerifyResetCodeUsecase {
  constructor(private readonly resetCodeRepository: IResetCodeRepository) {
  }


  /**
   * 인증 코드 검증 실행
   * @param dto VerifyResetCodeDto
   * @returns 성공 메시지
   */

  async execute(dto: VerifyResetCodeDto): Promise<MessageResponse> {
    const { email, code } = dto;
    logger.info(`[VerifyResetCodeUsecase] 인증 코드 검증 요청: email=${email}`);

    const storedCode = await this.resetCodeRepository.find(email);

    if (!storedCode) {
      logger.warn(`[VerifyResetCodeUsecase] 인증 코드 없음: email=${email}`);
      throw new CustomError(HttpStatus.BAD_REQUEST, '인증 코드가 만료되었거나 존재하지 않습니다.');
    }

    if (storedCode !== code) {
      logger.warn(`[VerifyResetCodeUsecase] 인증 코드 불일치: email=${email}`);
      throw new CustomError(HttpStatus.BAD_REQUEST, '인증 코드가 올바르지 않습니다.');
    }

    logger.info(`[VerifyResetCodeUsecase] 인증 코드 검증 성공: email=${email}`);

    return {
      success: true,
      message: '인증 코드가 확인되었습니다.',
      data: null,
    };
  }
}
