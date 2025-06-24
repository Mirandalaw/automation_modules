import { ChatRoomMember } from '../../entities/ChatRoomMember';

export interface IChatRoomMemberRepository {
  exists(roomId: number, userId: number): Promise<boolean>;
  save(member: ChatRoomMember): Promise<void>;
  remove(roomId: number, userId: number): Promise<void>;
  findMembersByRoom(roomId: number): Promise<ChatRoomMember[] | null>;
  findByUserId(userId: number): Promise<ChatRoomMember[]>;
  findByRoomAndUser(
    roomId: number,
    userId: number
  ): Promise<ChatRoomMember | null>;

  updateLastReadMessageId(
    roomId: number,
    userId: number,
    messageId: number
  ): Promise<void>;
  deactivateMember(roomId: number, userId: number): Promise<void>;
  blockUser(roomId: number, userId: number): Promise<void>;
  findActiveMembersByRoom(roomId: number): Promise<ChatRoomMember[]>;
  countMembers(roomId: number): Promise<number>;
}
