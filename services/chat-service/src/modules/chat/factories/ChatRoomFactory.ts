import { ChatRoom } from '../entities/ChatRoom';

/**
 * ChatRoomFactory
 * - 채팅방 도메인 객체 생성을 위한 팩토리 클래스
 * - PUBLIC / PRIVATE 유형에 따라 객체 생성 책임을 분리
 */
export class ChatRoomFactory {
  static createPrivateRoom(itemId: number, createdBy: number): ChatRoom {
    return new ChatRoom(
      0, // id는 DB에서 생성됨
      'PRIVATE',
      itemId,
      createdBy,
      true,
      new Date()
    );
  }

  static createPublicRoom(createdBy: number): ChatRoom {
    return new ChatRoom(
      0,
      'PUBLIC',
      null,
      createdBy,
      true,
      new Date()
    );
  }
}