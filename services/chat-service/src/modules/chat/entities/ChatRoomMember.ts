export class ChatRoomMember {
  // 채팅방 ID
  public readonly roomId: number;

  // 사용자 ID
  public readonly userId: number;

  // 입장 시간
  public readonly joinedAt: Date;

  constructor(roomId: number, userId: number, joinedAt: Date = new Date()) {
    this.roomId = roomId;
    this.userId = userId;
    this.joinedAt = joinedAt;
  }
}