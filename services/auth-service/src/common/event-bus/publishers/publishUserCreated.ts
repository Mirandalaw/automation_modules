import { connection } from './publishEvent';
import logger from '../../logger';

export interface UserCreatedPayload {
  uuid: string;
  email: string;
  nickname: string;
}

/**
 * user.created 이벤트 발행 유틸
 * - 회원가입 이후 다른 도메인 또는 자체 구독자에게 등급 생성 트리거 용도
 */

export const publishUserCreated = async (payload: UserCreatedPayload): Promise<void> => {
  try {
    await connection('user', 'user.created', payload);
    logger.info(`[Event] user.created 발행 완료: ${JSON.stringify(payload)}`);
  } catch (err) {
    logger.error(`[Event] user.created 발행 실패: ${(err as Error).message}`);
    throw err;
  }
};