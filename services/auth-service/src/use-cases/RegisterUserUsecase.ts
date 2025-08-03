import { RegisterUserDto } from '../dtos/RegisterUserDto';
import { CustomError } from '../common/errors';
import { HttpStatus } from '../constants/httpStatus';
import logger from '../common/logger';
import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { UserFactory } from '../factories/UserFactory';
import {publishUserCreated} from '../common/event-bus/publishers/publishUserCreated';

export class RegisterUserUsecase {
  constructor(
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * 회원가입 요청 처리
   * - 이메일 중복 체크
   * - 비밀번호 해시화
   * - User 저장
   * - user.created 이벤트 발행
   * @param dto 클라이언트로부터 전달받은 회원가입 정보
   */
  async execute(dto: RegisterUserDto): Promise<{ success: true; message: string }> {
    const { email } = dto;

    logger.info(`[RegisterUserUsecase] 회원가입 요청 수신: email=${email}`);

    // 이메일 중복 확인
    const exists = await this.userRepository.findByEmail(email);
    if (exists) {
      logger.warn(`[RegisterUserUsecase] 중복 이메일: ${email}`);
      throw new CustomError(HttpStatus.CONFLICT, '이미 존재하는 이메일입니다.');
    }

    // 사용자 생성 및 저장
    const newUser = await UserFactory.createWithHashedPassword(dto);
    try {
      await this.userRepository.save(newUser);
      logger.info(`[RegisterUserUsecase] 사용자 저장 성공: ${newUser.uuid}`);

      // user.created 이벤트 발행
      await publishUserCreated({
        id: newUser.id,
        email: newUser.email,
        nickname: newUser.nickname,
      });
    } catch (error) {
      logger.error(`[RegisterUserUsecase] 사용자 저장 실패: ${(error as Error).message}`);
      throw new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, '사용자 저장 중 오류 발생');
    }

    return {
      success: true,
      message: '회원가입 성공',
    };
  }
}
