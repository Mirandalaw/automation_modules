import { IChatRoomRepository } from '../repositories/interfaces/IChatRoomRepository';
import { ChatRoom } from '../entities/ChatRoom';

/**
 * GetPublicRoomsUsecase
 * - 활성화된 PUBLIC 채팅방 목록을 조회합니다.
 */
export class GetPublicRoomsUsecase {
  constructor(private readonly roomRepository: IChatRoomRepository) {}

  async execute(): Promise<ChatRoom[]> {
    const allRooms = await this.roomRepository.findAll();
    return allRooms.filter((room) => room.isPublic() && room.isActive);
  }
}
