import { ChatMessage } from '../entities/ChatMessage';

/**
 * ChatMessageFactory
 * - TEXT / SYSTEM 메시지 생성을 위한 팩토리 클래스
 * - 메시지의 종류에 따라 책임을 명확히 분리
 */
export class ChatMessageFactory {
  /**
   * 일반 텍스트 메시지 생성
   */
  static createTextMessage(roomId: number, senderId: number, content: string): ChatMessage {
    return new ChatMessage(0, roomId, senderId, content, new Date(), 'TEXT');
  }

  /**
   * 이미지 메시지 생성
   */
  static createImageMessage(roomId: number, senderId: number, imageUrl: string, thumbnailUrl?: string): ChatMessage {
    return new ChatMessage(
      0,
      roomId,
      senderId,
      '[이미지]', // 기본 표시 텍스트
      new Date(),
      'IMAGE',
      false,
      imageUrl,
      thumbnailUrl
    );
  }

  /**
   * 시스템 메시지 생성 (예: 입장, 퇴장 알림)
   */
  static createSystemMessage(roomId: number, content: string): ChatMessage {
    return new ChatMessage(
      0,
      roomId,
      0, // 시스템 발신자 ID는 0 처리
      content,
      new Date(),
      'SYSTEM'
    );
  }
}
