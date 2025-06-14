import { IChatRoomRepository } from '../interfaces/IChatRoomRepository';
import { ChatRoom } from '../../entities/ChatRoom';

/**
 * InMemoryChatRoomRepository
 * - 채팅방 정보를 메모리 기반으로 관리하는 저장소
 * - 테스트 및 MVP 단계에서 사용
 */
export class InMemoryChatRoomRepository implements IChatRoomRepository {
  private rooms: ChatRoom[] = [];

  /**
   * 채팅방 저장 또는 갱신
   * - ID가 0이면 자동 ID 부여
   */
  async save(room: ChatRoom): Promise<void> {
    const idx = this.rooms.findIndex((r) => r.id === room.id);

    if (room.id === 0) {
      const newId = this.rooms.length + 1;
      const newRoom = new ChatRoom(
        newId,
        room.type,
        room.itemId,
        room.createdBy,
        room.isActive,
        room.createdAt
      );
      this.rooms.push(newRoom);
      return;
    }

    if (idx !== -1) {
      this.rooms[idx] = room;
    } else {
      this.rooms.push(room);
    }
  }

  /**
   * ID로 채팅방 조회
   */
  async findById(id: number): Promise<ChatRoom | null> {
    return this.rooms.find((room) => room.id === id) ?? null;
  }

  /**
   * 전체 채팅방 목록 조회
   */
  async findAll(): Promise<ChatRoom[]> {
    return this.rooms;
  }

  /**
   * 특정 거래 아이템 ID로 PRIVATE 채팅방 조회
   */
  async findByItemId(itemId: number): Promise<ChatRoom | null> {
    return (
      this.rooms.find((room) => room.itemId === itemId && room.isPrivate()) ??
      null
    );
  }

  /**
   * PUBLIC 채팅방 목록 조회
   */
  async findPublicRooms(): Promise<ChatRoom[]> {
    return this.rooms.filter((room) => room.isPublic() && room.isActive);
  }
}
