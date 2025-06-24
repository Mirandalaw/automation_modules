import { IChatMessageRepository } from '../interfaces/IChatMessageRepository';
import { ChatMessage } from '../../entities/ChatMessage';

/**
 * InMemoryChatMessageRepository
 * - 메모리 기반 채팅 메시지 저장소 구현
 * - MVP 및 테스트용으로 사용
 * - 추후 DB/Redis로 교체 가능 (IChatMessageRepository 기반)
 */
export class InMemoryChatMessageRepository implements IChatMessageRepository {
  private messages: ChatMessage[] = [];

  /**
   * 메시지 저장
   * @param message 저장할 ChatMessage 객체
   */
  async save(message: ChatMessage): Promise<void> {
    this.messages.push(message);
  }

  /**
   * 특정 채팅방의 메시지 전체 조회
   * @param roomId 채팅방 ID
   * @returns 해당 채팅방의 삭제되지 않은 메시지 목록
   */
  async findByRoomId(roomId: number): Promise<ChatMessage[]> {
    return this.messages.filter(m => m.roomId === roomId && !m.isDeleted);
  }

  /**
   * 특정 사용자가 보낸 메시지 조회
   * @param senderId 사용자 ID
   * @returns 해당 사용자의 삭제되지 않은 메시지 목록
   */
  async findBySenderId(senderId: number): Promise<ChatMessage[]> {
    return this.messages.filter(m => m.senderId === senderId && !m.isDeleted);
  }

  /**
   * 최근 메시지 N개 조회 (시간 역순)
   * @param roomId 채팅방 ID
   * @param limit 최대 개수
   * @returns 삭제되지 않은 최근 메시지 목록
   */
  async findRecentMessages(roomId: number, limit: number): Promise<ChatMessage[]> {
    return this.messages
      .filter(m => m.roomId === roomId && !m.isDeleted)
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())
      .slice(0, limit);
  }

  /**
   * 메시지 수정
   * @param updated 수정된 ChatMessage 객체
   */
  async update(updated: ChatMessage): Promise<void> {
    const idx = this.messages.findIndex(m => m.id === updated.id);
    if (idx !== -1) {
      this.messages[idx] = updated;
    }
  }

  /**
   * 메시지 삭제 처리 (실제 삭제 X, soft delete)
   * @param messageId 삭제할 메시지 ID
   */
  async delete(messageId: number): Promise<void> {
    const msg = this.messages.find(m => m.id === messageId);
    if (msg) {
      msg.delete();
    }
  }

  /**
   * 메시지 ID로 조회
   * @param messageId 메시지 ID
   * @returns 메시지 객체 또는 null
   */
  async findById(messageId: number): Promise<ChatMessage | null> {
    const found = this.messages.find(m => m.id === messageId);
    return found ?? null;
  }
}
