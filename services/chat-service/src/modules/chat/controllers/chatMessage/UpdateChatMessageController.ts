import { Request, Response } from 'express';
import { InMemoryChatMessageRepository } from '../../repositories/implementations/InMemoryChatMessageRepository';

const chatMessageRepository = new InMemoryChatMessageRepository();

/**
 * PATCH /api/chat/messages/:id
 * - 채팅 메시지 수정 컨트롤러
 */
export async function updateChatMessage(req: Request, res: Response) {
  const messageId = Number(req.params.id);
  const { newContent } = req.body;

  const message = await chatMessageRepository.findById(messageId);
  if (!message || message.isDeleted) {
    return res.status(404).json({ message: '존재하지 않는 메시지입니다.' });
  }

  message.edit(newContent);
  await chatMessageRepository.update(message);

  return res.status(200).json({
    message: '메시지 수정 완료',
    data: message
  });
}
