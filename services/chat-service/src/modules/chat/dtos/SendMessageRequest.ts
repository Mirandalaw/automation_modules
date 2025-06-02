/**
 * 메시지 전송 요청 DTO
 * - WebSocket 또는 REST로 메시지를 보낼 때 사용
 */
export class SendMessageRequest {
  // 채팅방 ID
  public readonly roomId: number;

  // 전송자 ID
  public readonly senderId: number;

  // 메시지 본문
  public readonly content: string;

  constructor(roomId: number, senderId: number, content: string) {
    this.roomId = roomId;
    this.senderId = senderId;
    this.content = content;
  }
}