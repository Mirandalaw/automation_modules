import { JoinRoomUsecase } from '../usecases/JoinRoomUsecase';
import { LeaveRoomUsecase } from '../usecases/LeaveRoomUsecase';

/**
 * ChatRoomService
 * - 채팅방 입장 및 퇴장 흐름을 담당하는 서비스 레이어
 * - Gateway 또는 Controller에서 유저의 요청을 받아 유즈케이스로 위임함
 */
export class ChatRoomService {
  constructor(
    private readonly joinRoomUsecase: JoinRoomUsecase,
    private readonly leaveRoomUsecase: LeaveRoomUsecase
  ) {}

  async join(roomId: number, userId: number): Promise<void> {
    await this.joinRoomUsecase.execute(roomId, userId);
  }

  async leave(roomId: number, userId: number): Promise<void> {
    await this.leaveRoomUsecase.execute(roomId, userId);
  }
}
