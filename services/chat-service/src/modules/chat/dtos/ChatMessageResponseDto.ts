import { ChatMessage } from '../entities/ChatMessage';

/**
 * ChatMessageResponseDto
 * - 채팅 메시지 응답 시 사용되는 형식
 */
export class ChatMessageResponseDto {
  id: number;
  roomId: number;
  senderId: number;
  content: string;
  sentAt: Date;
  type: 'TEXT' | 'IMAGE' | 'SYSTEM';
  fileUrl?: string;
  thumbnailUrl?: string;
  isDeleted: boolean;
  editedAt?: Date;

  constructor(entity: ChatMessage) {
    this.id = entity.id;
    this.roomId = entity.roomId;
    this.senderId = entity.senderId;
    this.content = entity.content;
    this.sentAt = entity.sentAt;
    this.type = entity.type;
    this.fileUrl = entity.fileUrl;
    this.thumbnailUrl = entity.thumbnailUrl;
    this.isDeleted = entity.isDeleted;
    this.editedAt = entity.editedAt;
  }
}
