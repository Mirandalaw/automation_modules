/**
 * ChatRoom
 * - 채팅방 도메인 객체 (DB 저장 목적 X)
 * - 거래 기반 PRIVATE, 일반 PUBLIC 채팅방을 표현
 */
export class ChatRoom {
  public readonly id: number;
  public readonly type: 'PUBLIC' | 'PRIVATE';
  public readonly itemId: number | null;
  public readonly createdBy: number;
  public isActive: boolean;
  public readonly createdAt: Date;

  constructor(
    id: number,
    type: 'PUBLIC' | 'PRIVATE',
    itemId: number | null,
    createdBy: number,
    isActive = true,
    createdAt = new Date()
  ) {
    this.id = id;
    this.type = type;
    this.itemId = itemId;
    this.createdBy = createdBy;
    this.isActive = isActive;
    this.createdAt = createdAt;
  }

  /**
   * 채팅방 비활성화 (삭제 등)
   */
  deactivate(): void {
    this.isActive = false;
  }

  /**
   * PUBLIC 여부
   */
  isPublic(): boolean {
    return this.type === 'PUBLIC';
  }

  /**
   * PRIVATE 여부
   */
  isPrivate(): boolean {
    return this.type === 'PRIVATE';
  }
}
