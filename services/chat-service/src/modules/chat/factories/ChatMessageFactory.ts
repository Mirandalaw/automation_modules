import { ChatMessage } from '../entities/ChatMessage';

/**
 * ChatMessageFactory
 * - TEXT / SYSTEM 메시지 생성을 위한 팩토리 클래스
 * - 메시지의 종류에 따라 책임을 명확히 분리
 */
export class ChatMessageFactory {
  static createTextMessage(roomId: number, senderId: number, content: string): ChatMessage {
    return new ChatMessage(
      0,
      roomId,
      senderId,
      content,
      'TEXT',
      new Date()
    );
  }

  static createSystemMessage(roomId: number, content: string): ChatMessage {
    return new ChatMessage(
      0,
      roomId,
      null,
      content,
      'SYSTEM',
      new Date()
    );
  }
}