import { IPointRepository } from '../repositories/interfaces/IPointRepository';
import { CustomError } from '../common/errors';
import { HttpStatus } from '../constants/httpStatus';

/**
 * PointService
 * - 포인트 도메인에 대한 비즈니스 로직 담당 서비스 클래스
 * - 포인트 적립/사용 처리 및 잔액 계산 로직 포함
 */
export class PointService {
  constructor(private readonly pointRepository: IPointRepository) {
  }

  /**
   * 사용자의 현재 사용 가능 포인트를 계산
   * - 적립된 포인트 총합 - 사용된 포인트 총합
   * - 마이페이지, 거래시 포인트 사용 가능 여부 등에 사용
   *
   * @param userId 사용자 ID
   * @returns 사용 가능한 포인트 금액 (int)
   */
  async getAvailablePoint(userId: number): Promise<number> {
    const earned = await this.pointRepository.sumPoints(userId, 'EARN');
    const used = await this.pointRepository.sumPoints(userId, 'USE');
    return earned - used;
  }

  /**
   * 포인트 충전 처리
   * - amount는 양수만 가능
   * - 관리자 지급, 보상 지급, 충전소 등을 통해 포인트 적립
   *
   * @param userId 사용자 ID
   * @param amount 적립할 포인트 양
   * @param description 적립 사유 또는 출처 설명
   */
  async deposit(userId: number, amount: number, description?: string) {
    if (amount <= 0) {
      throw new CustomError(HttpStatus.BAD_REQUEST, '0원 이하 충전은 허용되지 않습니다.');
    }

    await this.pointRepository.save({
      userId,
      type: 'EARN',
      amount,
      description,
    });
  }

  /**
   * 포인트 출금 처리
   * - 현재 보유 포인트보다 많은 금액 출금 시 예외 발생
   * - 출금은 사용자 상품 구매, 포인트 환급 등에서 사용
   *
   * @param userId 사용자 ID
   * @param amount 출금할 포인트 양
   * @param description 출금 사유 또는 사용처 설명
   */
  async withdraw(userId: number, amount: number, description?: string) {
    const available = await this.getAvailablePoint(userId);

    if (amount > available) {
      throw new CustomError(HttpStatus.BAD_REQUEST, '포인트 잔액이 부족합니다.');
    }

    await this.pointRepository.save({
      userId,
      type: 'USE',
      amount,
      description,
    });
  }
}
