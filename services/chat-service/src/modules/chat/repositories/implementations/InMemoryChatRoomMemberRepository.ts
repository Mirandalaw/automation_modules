import { IChatRoomMemberRepository } from '../interfaces/IChatRoomMemberRepository';
import { ChatRoomMember } from '../../entities/ChatRoomMember';

/**
 * InMemoryChatRoomMemberRepository
 * - 메모리 기반 채팅방 참여자 저장소 (MVP용)
 * - 실제 DB 연동 전 테스트 및 운영에 사용
 */
export class InMemoryChatRoomMemberRepository implements IChatRoomMemberRepository {
  private members: ChatRoomMember[] = [];

  /**
   * 특정 유저가 해당 채팅방에 존재하는지 여부 확인
   */
  async exists(roomId: number, userId: number): Promise<boolean> {
    return this.members.some(m => m.roomId === roomId && m.userId === userId);
  }

  /**
   * 참여자 정보 저장 또는 갱신
   * - 기존 존재하면 업데이트, 없으면 새로 추가
   */
  async save(member: ChatRoomMember): Promise<void> {
    const idx = this.members.findIndex(m => m.roomId === member.roomId && m.userId === member.userId);
    if (idx !== -1) {
      this.members[idx] = member;
    } else {
      this.members.push(member);
    }
  }

  /**
   * 채팅방에서 특정 유저 제거
   */
  async remove(roomId: number, userId: number): Promise<void> {
    this.members = this.members.filter(m => !(m.roomId === roomId && m.userId === userId));
  }

  /**
   * 특정 채팅방의 전체 참여자 조회
   * - 없으면 null 반환
   */
  async findMembersByRoom(roomId: number): Promise<ChatRoomMember[] | null> {
    const result = this.members.filter(m => m.roomId === roomId);
    return result.length ? result : null;
  }

  /**
   * 특정 유저가 참여한 모든 채팅방 목록 조회
   */
  async findByUserId(userId: number): Promise<ChatRoomMember[]> {
    return this.members.filter(m => m.userId === userId);
  }

  /**
   * 특정 채팅방 내 유저의 참여 정보 조회
   */
  async findByRoomAndUser(roomId: number, userId: number): Promise<ChatRoomMember | null> {
    return this.members.find(m => m.roomId === roomId && m.userId === userId) ?? null;
  }

  /**
   * 마지막 읽은 메시지 ID 갱신
   */
  async updateLastReadMessageId(roomId: number, userId: number, messageId: number): Promise<void> {
    const member = await this.findByRoomAndUser(roomId, userId);
    if (member) {
      member.readMessage(messageId);
    }
  }

  /**
   * 참여자 비활성화 (방 나가기 처리)
   */
  async deactivateMember(roomId: number, userId: number): Promise<void> {
    const member = await this.findByRoomAndUser(roomId, userId);
    if (member) {
      member.leave();
    }
  }

  /**
   * 참여자 강제 차단 처리
   */
  async blockUser(roomId: number, userId: number): Promise<void> {
    const member = await this.findByRoomAndUser(roomId, userId);
    if (member) {
      member.block();
    }
  }

  /**
   * 현재 방에 남아있는 활성 유저 목록 조회
   */
  async findActiveMembersByRoom(roomId: number): Promise<ChatRoomMember[]> {
    return this.members.filter(m => m.roomId === roomId && m.isActive && !m.isBlocked);
  }

  /**
   * 현재 방에 참여 중인 유저 수 카운트
   */
  async countMembers(roomId: number): Promise<number> {
    return this.members.filter(m => m.roomId === roomId && m.isActive && !m.isBlocked).length;
  }
}
