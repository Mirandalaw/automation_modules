import { IChatRoomRepository } from '../repositories/interfaces/IChatRoomRepository';
import { IChatRoomMemberRepository } from '../repositories/interfaces/IChatRoomMemberRepository';
import { CreatePrivateRoomRequest } from '../dtos/CreatePrivateRoomRequest';
import { ChatRoomFactory } from '../factories/ChatRoomFactory';
import { ChatRoomMember } from '../entities/ChatRoomMember';

/**
 * CreatePrivateRoomUsecase
 * - 거래 아이템 기반 1:1 PRIVATE 채팅방을 생성하고, 참여자를 등록함
 */
export class CreatePrivateRoomUsecase {
  constructor(
    private readonly roomRepo: IChatRoomRepository,
    private readonly memberRepo: IChatRoomMemberRepository
  ) {}

  async execute(dto: CreatePrivateRoomRequest): Promise<number> {
    const room = ChatRoomFactory.createPrivateRoom(dto.itemId, dto.sellerId);
    await this.roomRepo.save(room);

    const buyer = new ChatRoomMember(room.id, dto.buyerId);
    const seller = new ChatRoomMember(room.id, dto.sellerId);

    await this.memberRepo.save(buyer);
    await this.memberRepo.save(seller);

    return room.id;
  }
}