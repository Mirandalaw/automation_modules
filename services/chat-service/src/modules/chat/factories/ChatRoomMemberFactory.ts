import { ChatRoomMember } from '../entities/ChatRoomMember';

/**
 * ChatRoomMemberFactory
 * - 채팅방 참여자 도메인 객체 생성을 책임지는 팩토리 클래스
 * - 참여 상태, 권한, 차단 여부 등 다양한 생성 상황을 대응합니다.
 */
export class ChatRoomMemberFactory {
  /**
   * 일반 사용자로 채팅방 참여자 생성
   * - 기본 설정: isActive=true, isBlocked=false, role='MEMBER'
   */
  static create(roomId: number, userId: number): ChatRoomMember {
    return new ChatRoomMember(roomId, userId);
  }

  /**
   * 방장(OWNER) 권한으로 참여자 생성
   * - 사용 예: 채팅방 생성자 자동 참여 등록
   */
  static createOwner(roomId: number, userId: number): ChatRoomMember {
    return new ChatRoomMember(roomId, userId, new Date(), true, false, 'OWNER');
  }

  /**
   * 차단된 사용자 참여자 객체 생성
   * - isBlocked = true, isActive = false
   * - 사용 예: 운영자가 특정 유저를 강제 퇴장 처리할 때
   */
  static createBlocked(roomId: number, userId: number): ChatRoomMember {
    return new ChatRoomMember(roomId, userId, new Date(), false, true, 'MEMBER');
  }

  /**
   * 비활성화된 참여자 객체 생성
   * - 사용 예: 복원 처리나 일시 퇴장 처리 용도
   */
  static createInactive(roomId: number, userId: number): ChatRoomMember {
    return new ChatRoomMember(roomId, userId, new Date(), false, false, 'MEMBER');
  }

  /**
   * 시스템 유저(관리자, 알림 등) 전용 참여자 생성
   * - userId = 0 등 특별한 발신자를 의미
   */
  static createSystem(roomId: number): ChatRoomMember {
    return new ChatRoomMember(roomId, 0, new Date(), true, false, 'OWNER');
  }
}
