import { IChatMessageRepository } from '../interfaces/IChatMessageRepository';
import { ChatMessage } from '../../entities/ChatMessage';

/**
 * InMemoryChatMessageRepository
 * - 채팅 메시지를 메모리 상에 저장하는 MVP용 저장소
 */
export class InMemoryChatMessageRepository implements IChatMessageRepository {
  private messages: ChatMessage[] = [];

  /**
   * 메시지 저장
   * - ID는 DB에서 생성된다 가정하고 기본적으로 0으로 입력됨
   */
  async save(message: ChatMessage): Promise<void> {
    const id = this.messages.length + 1;
    const newMessage = new ChatMessage(id, message.roomId, message.senderId, message.content, message.sentAt);
    this.messages.push(newMessage);
  }

  /**
   * 특정 채팅방의 전체 메시지 조회
   */
  async findByRoomId(roomId: number): Promise<ChatMessage[]> {
    return this.messages.filter(msg => msg.roomId === roomId);
  }

  /**
   * 해당 채팅방의 가장 최근 메시지 조회
   */
  async findLatestMessage(roomId: number): Promise<ChatMessage | null> {
    const roomMessages = this.messages
      .filter(m => m.roomId === roomId)
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());

    return roomMessages[0] ?? null;
  }
}
