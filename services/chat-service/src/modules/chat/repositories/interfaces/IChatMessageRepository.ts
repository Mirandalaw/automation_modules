import { ChatMessage } from '../../entities/ChatMessage';

/**
 * IChatMessageRepository
 * - 채팅 메시지 저장소에 대한 추상화 인터페이스
 * - 비즈니스 로직에서는 이 인터페이스에만 의존하며, 구현체는 외부 주입됨
 */
export interface IChatMessageRepository {
  findByRoomId(roomId: number): Promise<ChatMessage[]>;
  findLatestMessage(roomId: number): Promise<ChatMessage | null>;
  save(message: ChatMessage): Promise<void>;
}
