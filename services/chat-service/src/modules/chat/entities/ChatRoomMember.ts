/**
 * ChatRoomMember
 * - 채팅방에 참여한 사용자 정보를 나타내는 도메인 모델
 * - 참여 상태, 차단 여부, 마지막 읽은 메시지 등 상태 관리
 */
export class ChatRoomMember {
  public readonly roomId: number;
  public readonly userId: number;
  public readonly joinedAt: Date;
  public isActive: boolean;
  public isBlocked: boolean;
  public lastReadMessageId?: number;
  public role: 'OWNER' | 'MEMBER';

  constructor(
    roomId: number,
    userId: number,
    joinedAt: Date = new Date(),
    isActive = true,
    isBlocked = false,
    role: 'OWNER' | 'MEMBER' = 'MEMBER',
    lastReadMessageId?: number
  ) {
    this.roomId = roomId;
    this.userId = userId;
    this.joinedAt = joinedAt;
    this.isActive = isActive;
    this.isBlocked = isBlocked;
    this.role = role;
    this.lastReadMessageId = lastReadMessageId;
  }

  /**
   * 채팅방에서 나가기 (비활성화 처리)
   */
  leave() {
    this.isActive = false;
  }

  /**
   * 차단 처리 (isBlocked + isActive false)
   */
  block() {
    this.isBlocked = true;
    this.isActive = false;
  }

  /**
   * 마지막 읽은 메시지 ID 업데이트
   * @param messageId 읽은 메시지 ID
   */
  readMessage(messageId: number) {
    this.lastReadMessageId = messageId;
  }

  /**
   * 사용자 역할 변경
   * @param role 새 역할 ('OWNER' | 'MEMBER')
   */
  changeRole(role: 'OWNER' | 'MEMBER') {
    this.role = role;
  }
}
