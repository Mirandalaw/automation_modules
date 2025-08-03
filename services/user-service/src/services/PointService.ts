import { IPointRepository } from '../repositories/interfaces/IPointRepository';
import { CustomError } from '../common/errors';
import { HttpStatus } from '../constants/httpStatus';

/**
 * PointService
 * - 포인트 도메인에 대한 비즈니스 로직 담당 서비스 클래스
 * - 포인트 적립/사용 처리 및 잔액 계산 로직 포함
 */
export class PointService {
  constructor(private readonly pointRepository: IPointRepository) {}

  /**
   * 사용자의 현재 사용 가능 포인트를 계산
   * - 적립된 포인트 총합 - 사용된 포인트 총합
   * - 마이페이지, 거래시 포인트 사용 가능 여부 등에 사용
   *
   * @param userUuid 사용자 UUID
   * @returns 사용 가능한 포인트 금액 (int)
   */
  async getAvailablePoint(userUuid: string): Promise<number> {
    const earned = await this.pointRepository.sumPoints(userUuid, 'EARN');
    const used = await this.pointRepository.sumPoints(userUuid, 'USE');
    return earned - used;
  }

  /**
   * 포인트 충전 처리
   * - amount는 양수만 가능
   *
   * @param userUuid 사용자 UUID
   * @param amount 적립할 포인트 양
   * @param description 적립 사유 또는 출처 설명
   */
  async deposit(userUuid: string, amount: number, description?: string) {
    if (amount <= 0) {
      throw new CustomError(HttpStatus.BAD_REQUEST, '0원 이하 충전은 허용되지 않습니다.');
    }

    await this.pointRepository.save({
      userUuid,
      type: 'EARN',
      amount,
      description,
    });
  }

  /**
   * 포인트 출금 처리
   * - 현재 보유 포인트보다 많은 금액 출금 시 예외 발생
   *
   * @param userUuid 사용자 UUID
   * @param amount 출금할 포인트 양
   * @param description 출금 사유 또는 사용처 설명
   */
  async withdraw(userUuid: string, amount: number, description?: string) {
    const available = await this.getAvailablePoint(userUuid);

    if (amount > available) {
      throw new CustomError(HttpStatus.BAD_REQUEST, '포인트 잔액이 부족합니다.');
    }

    await this.pointRepository.save({
      userUuid,
      type: 'USE',
      amount,
      description,
    });
  }
}
