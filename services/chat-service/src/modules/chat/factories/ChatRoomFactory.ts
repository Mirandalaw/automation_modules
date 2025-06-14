import { ChatRoom } from '../entities/ChatRoom';

/**
 * ChatRoomFactory
 * - 채팅방 도메인 객체 생성 책임을 분리
 * - PUBLIC, PRIVATE 방에 따라 생성 방식 구분
 */
export class ChatRoomFactory {
  /**
   * PRIVATE 채팅방 생성
   * - 거래 아이템을 기반으로 생성자와 1:1 채팅방
   * @param itemId 거래 아이템 ID
   * @param createdBy 생성자(요청자) 사용자 ID
   */
  static createPrivateRoom(itemId: number, createdBy: number): ChatRoom {
    return new ChatRoom(
      0, // DB에서 자동 부여 예정
      'PRIVATE',
      itemId,
      createdBy,
      true,
      new Date()
    );
  }

  /**
   * PUBLIC 채팅방 생성
   * - 오픈 채팅 형태, itemId 없음
   * @param createdBy 생성자 사용자 ID
   */
  static createPublicRoom(createdBy: number): ChatRoom {
    return new ChatRoom(0, 'PUBLIC', null, createdBy, true, new Date());
  }
}
