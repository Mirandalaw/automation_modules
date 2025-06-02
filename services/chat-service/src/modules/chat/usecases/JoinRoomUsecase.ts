import { IChatRoomMemberRepository } from '../repositories/interfaces/IChatRoomMemberRepository';
import { ChatRoomMember } from '../entities/ChatRoomMember';

/**
 * JoinRoomUsecase
 * - 사용자를 채팅방에 입장시키는 유즈케이스
 * - 중복 입장 방지 및 참여자 저장 처리
 */
export class JoinRoomUsecase {
  constructor(private readonly memberRepository: IChatRoomMemberRepository) {}

  async execute(roomId: number, userId: number): Promise<void> {
    const alreadyJoined = await this.memberRepository.exists(roomId, userId);
    if (alreadyJoined) return;

    const member = new ChatRoomMember(0, roomId, userId, new Date());
    await this.memberRepository.save(member);
  }
}
