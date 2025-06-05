import { IChatRoomRepository } from '../repositories/interfaces/IChatRoomRepository';
import { IChatRoomMemberRepository } from '../repositories/interfaces/IChatRoomMemberRepository';
import { JoinPublicRoomRequest } from '../dtos/JoinPublicRoomRequest';
import { ChatRoomMember } from '../entities/ChatRoomMember';

/**
 * JoinPublicRoomUsecase
 * - 공개 채팅방에 사용자 참여 처리 (중복 참여 방지 포함)
 */
export class JoinPublicRoomUsecase {
  constructor(
    private readonly roomRepo: IChatRoomRepository,
    private readonly memberRepo: IChatRoomMemberRepository
  ) {}

  async execute(dto: JoinPublicRoomRequest): Promise<void> {
    const room = await this.roomRepo.findById(dto.roomId);
    if (!room || room.type !== 'PUBLIC') throw new Error('공개 채팅방이 존재하지 않음');

    const exists = await this.memberRepo.exists(dto.roomId, dto.userId);
    if (exists) return;

    const member = new ChatRoomMember(dto.roomId, dto.userId);
    await this.memberRepo.save(member);
  }
}