import { ChatMessage } from '../entities/ChatMessage';

export class ChatMessageResponse {
  // 메시지 ID
  public readonly messageId: number;

  // 발신자 ID (SYSTEM 메시지는 null)
  public readonly senderId: number | null;

  // 메시지 본문
  public readonly content: string;

  // 메시지 타입
  public readonly type: 'TEXT' | 'SYSTEM';

  // 메시지 전송 시각 (ISO 포맷)
  public readonly sentAt: string;

  constructor(
    messageId: number,
    senderId: number | null,
    content: string,
    type: 'TEXT' | 'SYSTEM',
    sentAt: string
  ) {
    this.messageId = messageId;
    this.senderId = senderId;
    this.content = content;
    this.type = type;
    this.sentAt = sentAt;
  }

  static fromEntity(entity: ChatMessage): ChatMessageResponse {
    return new ChatMessageResponse(
      entity.id,
      entity.senderId,
      entity.content,
      entity.type,
      entity.sentAt.toISOString()
    );
  }
}
