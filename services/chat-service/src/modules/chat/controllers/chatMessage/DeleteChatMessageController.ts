import { Request, Response } from 'express';
import { InMemoryChatMessageRepository } from '../../repositories/implementations/InMemoryChatMessageRepository';

const chatMessageRepository = new InMemoryChatMessageRepository();

/**
 * DELETE /api/chat/messages/:id
 * - 채팅 메시지 삭제 컨트롤러
 */
export async function deleteChatMessage(req: Request, res: Response) {
  const messageId = Number(req.params.id);

  const message = await chatMessageRepository.findById(messageId);
  if (!message || message.isDeleted) {
    return res.status(404).json({ message: '존재하지 않는 메시지입니다.' });
  }

  await chatMessageRepository.delete(messageId);

  return res.status(200).json({ message: '메시지 삭제 완료' });
}
