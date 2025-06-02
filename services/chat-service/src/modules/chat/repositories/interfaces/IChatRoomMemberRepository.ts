import { ChatRoomMember } from '../../entities/ChatRoomMember';

/**
 * IChatRoomMemberRepository
 * - 채팅방 참여자 저장소에 대한 추상화 인터페이스
 * - 참여자 조회 및 중복 확인, 저장 기능 제공
 */
export interface IChatRoomMemberRepository {
  exists(roomId: number, userId: number): Promise<boolean>;
  save(member: ChatRoomMember): Promise<void>;
  remove(roomId: number, userId: number): Promise<void>;
  findMembersByRoom(roomId: number): Promise<ChatRoomMember[]>;
}