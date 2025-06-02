import { IChatRoomMemberRepository } from '../repositories/interfaces/IChatRoomMemberRepository';

/**
 * LeaveRoomUsecase
 * - 사용자가 채팅방에서 퇴장하는 로직 처리
 * - 참여자 목록에서 해당 유저를 제거함
 */
export class LeaveRoomUsecase {
  constructor(private readonly memberRepository: IChatRoomMemberRepository) {}

  async execute(roomId: number, userId: number): Promise<void> {
    const exists = await this.memberRepository.exists(roomId, userId);
    if (!exists) return;

    await this.memberRepository.remove(roomId, userId);
  }
}
