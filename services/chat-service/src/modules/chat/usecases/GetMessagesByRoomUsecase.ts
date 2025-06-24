import { IChatMessageRepository } from '../repositories/interfaces/IChatMessageRepository';
import { ChatMessage } from '../entities/ChatMessage';

/**
 * GetMessagesByRoomUsecase
 * - 특정 채팅방의 메시지를 최신순으로 조회합니다.
 */
export class GetMessagesByRoomUsecase {
  constructor(private readonly messageRepository: IChatMessageRepository) {}

  async execute(roomId: number): Promise<ChatMessage[]> {
    const messages = await this.messageRepository.findByRoomId(roomId);
    return messages.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime()); // 시간순 정렬
  }
}
