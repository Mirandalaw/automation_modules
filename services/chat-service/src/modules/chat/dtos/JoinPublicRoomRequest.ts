export class JoinPublicRoomRequest {
  // 사용자 ID
  public readonly userId: number;

  // 입장할 채팅방 ID
  public readonly roomId: number;

  constructor(userId: number, roomId: number) {
    this.userId = userId;
    this.roomId = roomId;
  }
}