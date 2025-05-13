import {User} from '../../../entities/User';
import { Session } from '../../../entities/Session';
import { TokenService } from '../../../services/token.service';
import {AuthTokenBundle} from '../types/responseTypes';
import logger from '../../../utils/logger';

/**
 * TokenBundleFactory => 유저와 세션을 기반으로 accessToken, refreshToken 묶음을 생성
 */
export class TokenBundleFactory {
  constructor(private readonly tokenService: TokenService) {}

  async create(user: User, session: Session): Promise<AuthTokenBundle> {
    logger.debug(`[TokenBundleFactory] 토큰 생성 시작: userId=${user.uuid}`);
    const { accessToken, refreshToken } = await this.tokenService.issue(user, session);

    return { accessToken, refreshToken };
  }
}
