import { ChatRoomMember } from '../../entities/ChatRoomMember';
import { IChatRoomMemberRepository } from '../interfaces/IChatRoomMemberRepository';

/**
 * InMemoryChatRoomMemberRepository
 * - 메모리 기반 채팅방 참여자 저장소 구현체
 */
export class InMemoryChatRoomMemberRepository implements IChatRoomMemberRepository {
  private readonly members: ChatRoomMember[] = [];

  async save(member: ChatRoomMember): Promise<void> {
    this.members.push(member);
  }

  async exists(roomId: number, userId: number): Promise<boolean> {
    return this.members.some(
      (m) => m.roomId === roomId && m.userId === userId
    );
  }

  async remove(roomId: number, userId: number): Promise<void> {
    const index = this.members.findIndex(
      (m) => m.roomId === roomId && m.userId === userId
    );
    if (index !== -1) {
      this.members.splice(index, 1);
    }
  }

  async findMembersByRoom(roomId: number): Promise<ChatRoomMember[]> {
    return this.members.filter((m) => m.roomId === roomId);
  }
}