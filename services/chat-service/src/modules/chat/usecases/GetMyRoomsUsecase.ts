import { IChatRoomRepository } from '../repositories/interfaces/IChatRoomRepository';
import { IChatRoomMemberRepository } from '../repositories/interfaces/IChatRoomMemberRepository';
import { ChatRoom } from '../entities/ChatRoom';

/**
 * GetMyRoomsUsecase
 * - 특정 사용자가 참여 중인 채팅방 목록 조회
 */
export class GetMyRoomsUsecase {
  constructor(
    private readonly roomRepo: IChatRoomRepository,
    private readonly memberRepo: IChatRoomMemberRepository
  ) {}

  async execute(userId: number): Promise<ChatRoom[]> {
    // 1. 유저가 참여한 roomId 목록 가져오기
    const memberships = await this.memberRepo.findByUserId(userId);
    const roomIds = memberships
      .filter((m) => m.isActive && !m.isBlocked)
      .map((m) => m.roomId);

    // 2. 해당 roomId들에 대한 ChatRoom 조회
    const allRooms = await Promise.all(
      roomIds.map((id) => this.roomRepo.findById(id))
    );

    // 3. null 제거
    return allRooms.filter((r): r is ChatRoom => r !== null);
  }
}
