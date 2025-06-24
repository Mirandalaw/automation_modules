import { Request, Response } from 'express';
import { InMemoryChatMessageRepository } from '../../repositories/implementations/InMemoryChatMessageRepository';

const chatMessageRepository = new InMemoryChatMessageRepository();

/**
 * GET /api/chat/messages/room/:roomId
 * - 채팅방 내 메시지 전체 조회
 */
export async function getMessagesByRoom(req: Request, res: Response) {
  const roomId = Number(req.params.roomId);

  const messages = await chatMessageRepository.findByRoomId(roomId);

  return res.status(200).json({
    message: '메시지 조회 성공',
    data: messages
  });
}
