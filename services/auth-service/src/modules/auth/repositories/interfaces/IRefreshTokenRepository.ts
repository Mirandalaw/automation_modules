import { RefreshTokenPayload } from '../../../../types/jwt';

export interface IRefreshTokenRepository {
  /**
   * RefreshToken을 저장합니다
   * @param userId 사용자 ID
   * @param payload 토큰 페이로드 (token 문자열 포함)
   */
  save(
    userId: string,
    payload: RefreshTokenPayload & { token: string; expiredAt: number }
  ): Promise<void>;

  /**
   * 특정 유저의 RefreshToken을 조회합니다
   * @param userId 사용자 ID
   */
  find(
    userId: string
  ): Promise<(RefreshTokenPayload & { token: string; expiredAt: number }) | null>;

  /**
   * 특정 유저의 RefreshToken을 삭제합니다
   * @param userId 사용자 ID
   */
  delete(userId: string): Promise<void>;
}