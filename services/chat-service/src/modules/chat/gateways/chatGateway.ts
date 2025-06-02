import { SendMessageUsecase } from '../usecases/SendMessageUsecase';
import { Namespace, Server, Socket } from 'socket.io';
import {ChatRoomService} from '../services/ChatRoomService';
import { SendMessageRequest } from '../dtos/SendMessageRequest';

/**
 * ChatGateway
 *- WebSocket 연결 및 채팅 관련 실시간 이벤트 처리
 */
export class ChatGateway {
  private io: Namespace;

  constructor(
    private readonly sendMessageUsecase: SendMessageUsecase,
    private readonly chatRoomService : ChatRoomService
    ) {}

  initialize(server: Server) {
    this.io = server.of('/chat');

    this.io.on('connection', (socket: Socket) => {
      console.log(` Client connected: ${socket.id}`);
      socket.on('join',async ({roomId,userId}: {roomId: number, userId: number}) =>{
        await this.chatRoomService.join(roomId,userId);
        socket.join(`room-${roomId}`);
        socket.to(`room-${roomId}`).emit(`system`,`${userId}님이 입장했습니다.`);
      });

      socket.on('leave', async ({ roomId, userId }: { roomId: number; userId: number }) => {
        await this.chatRoomService.leave(roomId, userId);
        socket.leave(`room-${roomId}`);
        socket.to(`room-${roomId}`).emit('system', `${userId}님이 퇴장했습니다.`);
      });


      socket.on('message', async (data: SendMessageRequest) => {
        await this.sendMessageUsecase.execute(data);
        socket.broadcast.emit(`chat/${data.roomId}`, {
          senderId: data.senderId,
          content: data.content,
        } as any);
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }
}