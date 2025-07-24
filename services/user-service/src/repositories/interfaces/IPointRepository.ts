/**
 * 포인트 유형 타입
 * - 'EARN': 적립
 * - 'USE': 사용
 */
export type PointType = 'EARN' | 'USE';

/**
 * 포인트 저장을 위한 입력 구조
 */
export interface PointSaveInput {
  userId: number;
  type: PointType;
  amount: number;
  description?: string;
}

/**
 * IPointRepository
 * - 포인트 도메인에 대한 추상 인터페이스
 * - 서비스 레이어에서 의존성 역전을 통해 구현체 분리 가능
 */
export interface IPointRepository {
  /**
   * 사용자 포인트 총합 조회
   * @param userId 사용자 ID
   * @param type 'EARN' 또는 'USE'
   */
  sumPoints(userId: number, type: PointType): Promise<number>;

  /**
   * 포인트 적립/사용 내역 저장
   * @param data 저장할 포인트 정보
   */
  save(data: PointSaveInput): Promise<void>;
}
