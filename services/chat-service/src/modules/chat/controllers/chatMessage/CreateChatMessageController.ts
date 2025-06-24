import { Request, Response } from 'express';
import { InMemoryChatMessageRepository } from '../../repositories/implementations/InMemoryChatMessageRepository';
import { ChatMessage } from '../../entities/ChatMessage';

const chatMessageRepository = new InMemoryChatMessageRepository();
let messageIdCounter = 1;

/**
 * POST /api/chat/messages
 * - 채팅 메시지 생성 컨트롤러
 */
export async function createChatMessage(req: Request, res: Response) {
  const { roomId, senderId, content, type, fileUrl, thumbnailUrl } = req.body;

  const message = new ChatMessage(
    messageIdCounter++,
    roomId,
    senderId,
    content,
    new Date(),
    type || 'TEXT',
    false,
    fileUrl,
    thumbnailUrl
  );

  await chatMessageRepository.save(message);

  return res.status(201).json({
    message: '메시지 전송 완료',
    data: message
  });
}
