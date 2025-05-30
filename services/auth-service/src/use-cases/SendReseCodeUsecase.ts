import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { IResetCodeRepository} from '../repositories/interfaces/IResetCodeRepository'
import { IMailProvider } from '../providers/interfaces/IMailProvider';
import { CustomError } from '../common/errors';
import { HttpStatus } from '../constants/httpStatus';
import { MessageResponse } from '../types/responseTypes';
import logger from '../common/logger';
import { SendResetCodeDto } from '../dtos/SendResetCodeDto';

/**
 * SendResetCodeUsecase
 * - 비밀번호 재설정 요청을 받은 사용자의 이메일로 인증 코드를 발송합니다.
 * - 인증 코드는 Redis 등 임시 저장소에 저장되며, 일정 시간 후 만료됩니다.
 */
export class SendResetCodeUsecase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly resetCodeRepository: IResetCodeRepository,
    private readonly mailProvider: IMailProvider
  ) {}

  /**
   * 인증코드 발송 로직
   * @param dto SendResetCodeDto
   * @returns { success: true, message: string }
   */
  async execute(dto : SendResetCodeDto): Promise<MessageResponse> {
    const {email} = dto;

    logger.info(`[SendResetCodeUsecase] 인증코드 발송 요청 수신: email=${email}`);

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      logger.warn(`[SendResetCodeUsecase] 존재하지 않는 사용자: ${email}`);
      throw new CustomError(HttpStatus.NOT_FOUND, '해당 이메일의 사용자가 존재하지 않습니다.');
    }

    // 6자리 인증코드 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Redis 저장 (기본 TTL: 5분)
    await this.resetCodeRepository.save(email, code, 300);

    // 이메일 발송
    await this.mailProvider.sendMail({
      to: email,
      subject: '[서비스명] 비밀번호 재설정 인증 코드',
      body: `인증 코드: ${code}\n5분 안에 입력해 주세요.`,
    });

    logger.info(`[SendResetCodeUsecase] 인증코드 전송 완료: email=${email}`);

    return {
      success: true,
      message: '인증 코드가 이메일로 전송되었습니다.',
      data: null,
    };
  }
}
