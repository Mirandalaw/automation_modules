import { subscribeToEvent } from '../common/event-bus/subscriber';
import logger from '../common/logger';
import { GradeService } from '../services/GradeService';
import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { IUserProfileRepository } from '../repositories/interfaces/IUserProfileRepository';
import { UserProfileFactory } from '../factories/UserProfileFactory';

export interface UserCreatedEventPayload {
  uuid: string;
  email: string;
  nickname: string;
}

/**
 * user.created 이벤트 구독 핸들러 등록
 */
export const subscribeUserCreated = async (
  gradeService: GradeService,
  userRepository: IUserRepository,
  userProfileRepository: IUserProfileRepository,
): Promise<void> => {
  await subscribeToEvent<UserCreatedEventPayload>(
    'user',                  // Exchange 이름
    'user.created',          // Routing Key
    'user.created.queue',    // Queue 이름
    async (payload) => {
      const uuid = payload.uuid;
      logger.info(`[Subscriber:user.created] 이벤트 수신 - uuid=${uuid}`);

      try {
        const existingUser = await userRepository.findByUUID(uuid);
        if (!existingUser) {
          const user = await userRepository.createUser({
            uuid,
            email: payload.email,
            nickname: payload.nickname,
          });
          logger.info(`[Subscriber:user.created] User 생성 완료 - id=${user.id}, uuid=${uuid}`);

          const profile = UserProfileFactory.createDefault(user);
          await userProfileRepository.save(profile);
        } else {
          logger.debug(`[Subscriber:user.created] 이미 존재하는 유저 - id=${existingUser.id}, uuid=${uuid}`);
        }

        await gradeService.createInitialStats(uuid);
        logger.info(`[Subscriber:user.created] UserStats 생성 완료 - uuid=${uuid}`);
      } catch (error) {
        logger.error(`[Subscriber:user.created] 처리 실패`, {
          uuid,
          error: (error as Error).message,
          stack: (error as Error).stack,
        });
      }
    }
  );
};
