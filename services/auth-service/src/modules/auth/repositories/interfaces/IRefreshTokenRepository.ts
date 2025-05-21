import { RefreshTokenPayload } from '../../../../types/jwt';
import { RefreshToken } from '../../../../entities/RefreshToken';

export interface IRefreshTokenRepository {
  /**
   * RefreshToken을 저장합니다.
   * @param entity RefreshToken Entity
   */
  save(entity: RefreshToken): Promise<void>;

  /**
   * 특정 유저의 RefreshToken을 조회합니다
   * @param userId 사용자 ID
   */
  find(
    userId: string,
  ): Promise<(RefreshTokenPayload & { token: string; expiredAt: number }) | null>;

  /**
   * 특정 유저의 RefreshToken을 삭제합니다
   * @param userId 사용자 ID
   */
  delete(userId: string): Promise<void>;
}