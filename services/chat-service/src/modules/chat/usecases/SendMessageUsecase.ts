import { IChatMessageRepository } from '../repositories/interfaces/IChatMessageRepository';
import { SendMessageRequest } from '../dtos/SendMessageRequest';
import { ChatMessageFactory } from '../factories/ChatMessageFactory';

/**
 * SendMessageUsecase
 * - 텍스트 메시지를 채팅방에 전송하고 저장하는 유즈케이스
 */
export class SendMessageUsecase {
  constructor(private readonly messageRepository: IChatMessageRepository) {}

  async execute(dto: SendMessageRequest): Promise<void> {
    // 메시지 도메인 객체 생성
    const message = ChatMessageFactory.createTextMessage(
      dto.roomId,
      dto.senderId,
      dto.content
    );
    await this.messageRepository.save(message);
  }
}
