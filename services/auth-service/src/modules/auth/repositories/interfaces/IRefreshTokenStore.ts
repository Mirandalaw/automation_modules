import { RefreshTokenPayload } from '../../../../types/jwt';

export interface IRefreshTokenStore {
  save(userId: string, payload: RefreshTokenPayload & { token: string; expiredAt: number }): Promise<void>;

  find(userId: string): Promise<(RefreshTokenPayload & { token: string; expiredAt: number }) | null>;

  delete(userId: string): Promise<void>;
}