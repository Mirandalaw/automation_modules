import { IChatRoomRepository } from '../repositories/interfaces/IChatRoomRepository';
import { IChatRoomMemberRepository } from '../repositories/interfaces/IChatRoomMemberRepository';
import { ChatRoomFactory } from '../factories/ChatRoomFactory';
import { ChatRoom } from '../entities/ChatRoom';
import { ChatRoomMemberFactory } from '../factories/ChatRoomMemberFactory';

/**
 * CreatePrivateRoomUsecase
 * - 거래 아이템 기반으로 PRIVATE 채팅방 생성
 * - 생성자도 자동 참여자로 등록
 */
export class CreatePrivateRoomUsecase {
  constructor(
    private readonly roomRepository: IChatRoomRepository,
    private readonly memberRepository: IChatRoomMemberRepository
  ) {}

  async execute(itemId: number, createdBy: number): Promise<ChatRoom> {
    // 1. 중복 방 확인
    const existing = await this.roomRepository.findByItemId(itemId);
    if (existing) return existing;

    // 2. 채팅방 생성
    const tempRoom = ChatRoomFactory.createPrivateRoom(itemId, createdBy);

    // 3. 저장 후, 실제 ID가 부여된 room 반환
    await this.roomRepository.save(tempRoom);
    const savedRoom = await this.roomRepository.findByItemId(itemId);
    if (!savedRoom) throw new Error('채팅방 저장 실패');

    // 4. 실제 room.id 기반으로 참여자 등록

    const member = ChatRoomMemberFactory.create(savedRoom.id, createdBy);
    await this.memberRepository.save(member);

    return savedRoom;
  }
}
