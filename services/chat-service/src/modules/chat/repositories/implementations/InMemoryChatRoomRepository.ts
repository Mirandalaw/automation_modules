import { IChatRoomRepository } from '../interfaces/IChatRoomRepository';
import { ChatRoom } from '../../entities/ChatRoom';

/**
 * InMemoryChatRoomRepository
 * - 테스트 및 초기 개발 환경을 위한 메모리 기반 채팅방 저장소 구현체
 */
export class InMemoryChatRoomRepository implements IChatRoomRepository {
  private rooms: ChatRoom[] = [];
  private currentId = 1;

  async findById(id: number): Promise<ChatRoom | null> {
    return this.rooms.find((room) => room.id === id) || null;
  }

  async findPublicRoomByItem(itemId: number): Promise<ChatRoom | null> {
    return this.rooms.find(
      (room) => room.type === 'PUBLIC' && room.itemId === itemId,
    ) || null;
  }

  async save(room: ChatRoom): Promise<void> {
    if (room.id === 0) {
      const assigned = new ChatRoom(
        this.currentId++,
        room.type,
        room.itemId,
        room.createdBy,
        room.isActive,
        room.createdAt,
      );
      this.rooms.push(assigned);
    } else {
      this.rooms.push(room);
    }
  }
}