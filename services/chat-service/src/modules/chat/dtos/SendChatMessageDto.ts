/**
 * SendChatMessageDto
 * - 클라이언트가 메시지 전송 시 사용하는 요청 데이터 형식
 */
export class SendChatMessageDto {
  roomId: number;
  senderId: number;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'SYSTEM';
  fileUrl?: string;
  thumbnailUrl?: string;
}
