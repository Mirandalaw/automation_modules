import { IChatRoomMemberRepository } from '../repositories/interfaces/IChatRoomMemberRepository';

/**
 * UpdateReadMessageUsecase
 * - 유저가 특정 채팅방에서 읽은 마지막 메시지 ID를 갱신합니다.
 */
export class UpdateReadMessageUsecase {
  constructor(private readonly memberRepo: IChatRoomMemberRepository) {}

  async execute(
    roomId: number,
    userId: number,
    messageId: number
  ): Promise<void> {
    const member = await this.memberRepo.findByRoomAndUser(roomId, userId);

    if (!member || !member.isActive || member.isBlocked) {
      throw new Error('유효하지 않은 참여자입니다.');
    }

    member.readMessage(messageId); // 도메인 객체 상태 변경

    await this.memberRepo.save(member); // 갱신된 객체 저장
  }
}
