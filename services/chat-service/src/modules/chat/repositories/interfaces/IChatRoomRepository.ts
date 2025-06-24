import { ChatRoom } from '../../entities/ChatRoom';

/**
 * IChatRoomRepository
 * - 채팅방 저장소에 대한 추상화 인터페이스
 * - 비즈니스 로직에서는 이 인터페이스에만 의존하며, 구현체는 외부 주입됨
 */
export interface IChatRoomRepository {
  save(room: ChatRoom): Promise<void>;
  findById(id: number): Promise<ChatRoom | null>;
  findAll(): Promise<ChatRoom[]>;
  findByItemId(itemId: number): Promise<ChatRoom | null>;
  findPublicRooms(): Promise<ChatRoom[]>;
}
