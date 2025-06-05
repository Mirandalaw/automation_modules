/**
 * ChatRoom 도메인 엔티티
 * - itemId를 기반으로 buyer와 seller 간 1:1 채팅방을 생성
 * - DB 저장용이 아니라 비즈니스 로직 처리용으로 사용됨
 */
export class ChatRoom {
  // 채팅방 고유 ID
  public readonly id: number;

  // 채팅방 유형: PUBLIC | PRIVATE
  public readonly type: 'PUBLIC' | 'PRIVATE';

  // 거래 품목 ID (PRIVATE 채팅방에만 해당)
  public readonly itemId: string | null;

  // 생성자 사용자 ID
  public readonly createdBy: string;

  // 채팅방 활성 여부
  public readonly isActive: boolean;

  // 채팅방 생성 시간
  public readonly createdAt: Date;

  constructor(
    id: number,
    type: 'PUBLIC' | 'PRIVATE',
    itemId: string | null,
    createdBy: string,
    isActive: boolean = true,
    createdAt: Date = new Date(),
  ) {
    this.id = id;
    this.type = type;
    this.itemId = itemId;
    this.createdBy = createdBy;
    this.isActive = isActive;
    this.createdAt = createdAt;
  }
}