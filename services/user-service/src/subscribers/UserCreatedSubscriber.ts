import { subscribeToEvent } from '../common/event-bus/subscriber';
import logger from '../common/logger';
import { GradeService } from '../services/GradeService';
import { IUserRepository } from '../repositories/interfaces/IUserRepository';

export interface UserCreatedEventPayload {
  id: number;
  email: string;
  nickname: string;
}

/**
 * user.created 이벤트 구독 핸들러 등록
 */
export const subscribeUserCreated = async (
  gradeService: GradeService,
  userRepository: IUserRepository
): Promise<void> => {
  await subscribeToEvent<UserCreatedEventPayload>(
    'user',                  // Exchange 이름
    'user.created',          // Routing Key
    'user.created.queue',    // Queue 이름
    async (payload) => {
      const userId = payload.id;
      logger.info(`[Subscriber:user.created] 이벤트 수신 - userId=${userId}`);

      try {
        const existingUser = await userRepository.findById(userId);
        if (!existingUser) {
          await userRepository.createUser({
            id: payload.id,
            email: payload.email,
            nickname: payload.nickname,
          });
          logger.info(`[Subscriber:user.created] User 생성 완료 - userId=${userId}`);
        } else {
          logger.debug(`[Subscriber:user.created] 이미 존재하는 유저 - userId=${userId}`);
        }

        await gradeService.createInitialStats(userId);
        logger.info(`[Subscriber:user.created] UserStats 생성 완료 - userId=${userId}`);
      } catch (error) {
        logger.error(`[Subscriber:user.created] 처리 실패`, {
          userId,
          error: (error as Error).message,
          stack: (error as Error).stack,
        });
        // (선택) 향후 DLQ 혹은 retry queue로 전송 고려
      }
    }
  );
};
