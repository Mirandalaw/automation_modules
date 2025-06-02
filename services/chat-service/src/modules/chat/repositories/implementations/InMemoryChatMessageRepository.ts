import { IChatMessageRepository } from '../interfaces/IChatMessageRepository';
import { ChatMessage } from '../../entities/ChatMessage';

/**
 * InMemoryChatMessageRepository
 * - 메모리 기반 채팅 메시지 저장소 구현체
 */
export class InMemoryChatMessageRepository implements IChatMessageRepository {
  private messages: ChatMessage[] = [];

  async findByRoomId(roomId: number): Promise<ChatMessage[]> {
    return this.messages.filter((m) => m.roomId === roomId);
  }

  async save(message: ChatMessage): Promise<void> {
    this.messages.push(message);
  }
}
