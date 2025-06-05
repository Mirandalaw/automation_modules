/**
 * ChatMessage 도메인 엔티티
 * - 채팅 메시지 1건에 해당하는 정보
 * - DB 저장용이 아닌 도메인 로직 중심으로 사용됨
 */
export class ChatMessage {
  // 메시지 고유 ID (Auto Increment)
  public readonly id: number;

  // 메시지를 보낸 채팅방 ID
  public readonly roomId: number;

  // 전송자 ID (SYSTEM 메시지는 null)
  public readonly senderId: number | null;

  // 메시지 본문 내용
  public readonly content: string;

  // 메시지 타입: TEXT | SYSTEM
  public readonly type: 'TEXT' | 'SYSTEM';

  // 메시지 전송 시간
  public readonly sentAt: Date;

  constructor(
    id: number,
    roomId: number,
    senderId: number | null,
    content: string,
    type: 'TEXT' | 'SYSTEM',
    sentAt: Date = new Date()
  ) {
    this.id = id;
    this.roomId = roomId;
    this.senderId = senderId;
    this.content = content;
    this.type = type;
    this.sentAt = sentAt;
  }
}