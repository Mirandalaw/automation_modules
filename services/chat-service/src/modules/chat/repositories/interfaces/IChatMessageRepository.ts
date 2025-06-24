import { ChatMessage } from '../../entities/ChatMessage';

/**
 * IChatMessageRepository
 * - 채팅 메시지 저장소 인터페이스
 */
export interface IChatMessageRepository {
  /**
   * 메시지 저장
   */
  save(message: ChatMessage): Promise<void>;

  /**
   * 채팅방 메시지 목록 조회
   */
  findByRoomId(roomId: number): Promise<ChatMessage[]>;

  /**
   * 유저가 보낸 메시지 목록 조회
   */
  findBySenderId(senderId: number): Promise<ChatMessage[]>;

  /**
   * 최근 메시지 N개 조회
   */
  findRecentMessages(roomId: number, limit: number): Promise<ChatMessage[]>;

  /**
   * 메시지 수정
   */
  update(message: ChatMessage): Promise<void>;

  /**
   * 메시지 삭제
   */
  delete(messageId: number): Promise<void>;

  /**
   * 메시지 ID로 조회
   */
  findById(messageId: number): Promise<ChatMessage | null>;
}
