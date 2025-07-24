import { Point } from '../entities/Point';
import { PointType } from '../repositories/interfaces/IPointRepository';

/**
 * PointFactory
 * - 포인트 도메인 객체 생성을 담당하는 팩토리 클래스
 * - 객체 생성 책임을 서비스/리포지토리에서 분리
 */
export class PointFactory {
  /**
   * 포인트 객체 생성
   * @param userId 사용자 ID
   * @param type 포인트 타입 (EARN | USE)
   * @param amount 포인트 금액
   * @param description 설명 (선택)
   */
  static create(userId: number, type: PointType, amount: number, description?: string): Point {
    const point = new Point();
    point.user = { id: userId } as any; // TypeORM 외래키 참조용
    point.type = type;
    point.amount = amount;
    point.description = description ?? null;
    return point;
  }
}
