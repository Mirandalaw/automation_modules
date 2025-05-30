import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import logger from '../../../common/logger';
import { CustomError } from '../../../common/errors';
import { HttpStatus } from '../../../constants/httpStatus';
import { hashPassword } from '../../../utils/hash';
import { IResetCodeRepository } from '../repositories/interfaces/IResetCodeRepository';


export class ResetPasswordUsecase{
  constructor(
    private readonly userRepository : IUserRepository,
    private readonly resetCodeStore: IResetCodeRepository,
  ) {
  } /**
   * 비밀번호 재설정 처리
   * @param dto.email 대상 사용자 이메일
   * @param dto.code 인증 코드 (클라이언트에 발송된 코드)
   * @param dto.newPassword 새 비밀번호
   */
  async execute(dto: { email: string; code: string; newPassword: string }): Promise<{
      success: true;
      message: string;
      data: null;
    }> {
    const { email, code, newPassword } = dto;

    logger.info(`[ResetPasswordUsecase] 비밀번호 재설정 요청: email=${email}`);

    // 1. 사용자 존재 여부 확인
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      logger.warn(`[ResetPasswordUsecase] 존재하지 않는 사용자: ${email}`);
      throw new CustomError(HttpStatus.NOT_FOUND, '존재하지 않는 사용자입니다.');
    }

    // 2. 인증 코드 검증
    const storedCode = await this.resetCodeStore.find(email);
    if (!storedCode || storedCode !== code) {
      logger.warn(`[ResetPasswordUsecase] 인증 코드 불일치: email=${email}`);
      throw new CustomError(HttpStatus.BAD_REQUEST, '인증 코드가 일치하지 않습니다.');
    }

    // 3. 비밀번호 해시화 및 저장
    const hashed = await hashPassword(newPassword);
    user.password = hashed;

    try {
      await this.userRepository.save(user);
      logger.info(`[ResetPasswordUsecase] 비밀번호 재설정 완료: userId=${user.uuid}`);
    } catch (err: any) {
      logger.error(`[ResetPasswordUsecase] 사용자 저장 실패: ${err.message}`);
      throw new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, '비밀번호 저장 중 오류가 발생했습니다.');
    }

    // 4. 인증 코드 삭제 (일회성)
    await this.resetCodeStore.delete(email);
    logger.info(`[ResetPasswordUsecase] 인증 코드 삭제 완료: email=${email}`);

    return {
      success: true,
      message: '비밀번호가 성공적으로 재설정되었습니다.',
      data: null,
    };
  }
}