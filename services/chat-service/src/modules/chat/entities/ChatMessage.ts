/**
 * ChatMessage
 * - 채팅 메시지 도메인 객체
 * - 일반 텍스트, 이미지, 시스템 메시지 등 다양한 유형을 지원
 */
export class ChatMessage {
  public readonly id: number;
  public readonly roomId: number;
  public readonly senderId: number;
  public content: string;
  public readonly sentAt: Date;

  public isDeleted: boolean;
  public editedAt?: Date;

  public readonly type: 'TEXT' | 'IMAGE' | 'SYSTEM';
  public readonly fileUrl?: string;
  public readonly thumbnailUrl?: string;

  constructor(
    id: number,
    roomId: number,
    senderId: number,
    content: string,
    sentAt: Date = new Date(),
    type: 'TEXT' | 'IMAGE' | 'SYSTEM' = 'TEXT',
    isDeleted = false,
    fileUrl?: string,
    thumbnailUrl?: string,
    editedAt?: Date
  ) {
    this.id = id;
    this.roomId = roomId;
    this.senderId = senderId;
    this.content = content;
    this.sentAt = sentAt;
    this.type = type;
    this.isDeleted = isDeleted;
    this.fileUrl = fileUrl;
    this.thumbnailUrl = thumbnailUrl;
    this.editedAt = editedAt;
  }

  /**
   * 메시지를 삭제 처리
   */
  delete(): void {
    this.isDeleted = true;
  }

  /**
   * 메시지 수정 처리
   */
  edit(newContent: string): void {
    this.content = newContent;
    this.editedAt = new Date();
  }
}
