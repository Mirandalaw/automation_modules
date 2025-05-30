import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { CustomError } from '../../../common/errors';
import { HttpStatus } from '../../../constants/httpStatus';
import logger from '../../../common/logger';
import { FindEmailResponse } from '../types/responseTypes';
import { FindEmailDto } from '../dtos/FindEmailDto';

/**
 * FindEmailUsecase
 *
 * - 사용자의 이름과 휴대폰 번호를 기반으로 이메일을 조회합니다.
 * - 회원가입 시 등록한 정보가 정확히 일치해야 조회됩니다.
 * - 정보가 일치하지 않으면 예외를 발생시켜 클라이언트에 명확하게 응답합니다.
 */
export class FindEmailUsecase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * 이름과 휴대폰 번호를 이용하여 사용자의 이메일을 반환합니다.
   * @returns 사용자의 이메일 주소 (string)
   * @throws CustomError - 사용자 정보가 일치하지 않을 경우 404 에러
   */
  async execute(dto:FindEmailDto): Promise<FindEmailResponse> {
    const { name, phone } = dto;

    logger.info(`[FindEmailUsecase] 이메일 찾기 요청: name=${name}, phone=${phone}`);

    const user = await this.userRepository.findByNameAndPhone(name, phone);

    if (!user) {
      logger.warn(`[FindEmailUsecase] 사용자 정보 불일치: name=${name}, phone=${phone}`);
      throw new CustomError(
        HttpStatus.NOT_FOUND,
        '입력하신 정보와 일치하는 이메일이 존재하지 않습니다.'
      );
    }

    logger.info(`[FindEmailUsecase] 이메일 조회 성공: ${user.email}`);

    return {
      success: true,
      message: '이메일 조회 성공',
      data: { email: user.email },
    };
  }
}
