import { Repository } from 'typeorm';
import { Point } from '../../entities/Point';
import { IPointRepository, PointSaveInput, PointType } from '../interfaces/IPointRepository';
import logger from '../../common/logger';
import { PointFactory } from '../../factories/PointFactory';

/**
 * PointRepository
 * - TypeORM 기반의 포인트 엔티티 저장소 구현체
 * - IPointRepository.ts 인터페이스를 구현하여 의존성 역전 및 테스트 용이성 확보
 * - 외부에서 getRepository(Point)로 생성된 Repository 인스턴스를 주입받음
 */
export class PointRepository implements IPointRepository {
  constructor(private readonly ormRepository: Repository<Point>) {
  }

  /**
   * 특정 사용자의 포인트 총합 조회
   * - 적립(EARN) 또는 사용(USE) 타입별로 합계 계산
   * - 포인트 잔액 계산 등에 활용됨
   *
   * @param userUuid 사용자 UUID
   * @param type 포인트 타입 ('EARN' | 'USE')
   * @returns 합산된 포인트 금액 (int)
   */
  async sumPoints(userUuid: string, type: PointType): Promise<number> {
    try {
      logger.debug(`[PointRepository] sumPoints 시작: userUuid=${userUuid}, type=${type}`);

      const result = await this.ormRepository
        .createQueryBuilder('point')
        .select('SUM(point.amount)', 'total')
        .where('point.userUuid = :userUuid AND point.type = :type', { userUuid, type })
        .getRawOne();

      const total = Number(result.total ?? 0);

      logger.debug(`[PointRepository] sumPoints 결과: userUuid=${userUuid}, type=${type}, total=${total}`);
      return total;
    } catch (err: any) {
      logger.error(`[PointRepository] sumPoints 실패: userUuid=${userUuid}, type=${type}, error=${err.message}`);
      throw err;
    }
  }

  /**
   * 포인트 기록 저장
   * - 사용자의 적립 또는 사용 이력을 포인트 테이블에 저장
   * - 외부에서 사용자 ID와 금액, 타입, 설명을 받아 처리
   *
   * @param data 저장할 포인트 정보 (userId, type, amount, description)
   */
  async save(data: PointSaveInput): Promise<void> {
    try {
      logger.debug(`[PointRepository] save 시작: userUuid=${data.userUuid}, type=${data.type}, amount=${data.amount}`);

      const point = PointFactory.create(data.userUuid, data.type, data.amount, data.description); // ← Factory 사용

      await this.ormRepository.save(point);

      logger.info(`[PointRepository] 포인트 저장 완료: userUuid=${data.userUuid}, type=${data.type}, amount=${data.amount}`);
    } catch (err: any) {
      logger.error(`[PointRepository] 포인트 저장 실패: userUuid=${data.userUuid}, error=${err.message}`);
      throw err;
    }
  }
}
