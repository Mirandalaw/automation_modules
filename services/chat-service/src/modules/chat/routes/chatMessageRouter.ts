import { Router } from 'express';
import { createChatMessage } from '../controllers/chatMessage/CreateChatMessageController';
import { updateChatMessage } from '../controllers/chatMessage/UpdateChatMessageController';
import { deleteChatMessage } from '../controllers/chatMessage/DeleteChatMessageController';
import { getMessagesByRoom } from '../controllers/chatMessage/GetMessagesByRoomController';

const chatMessageRouter = Router();

chatMessageRouter.post('/', createChatMessage);
chatMessageRouter.patch('/:id', updateChatMessage);
chatMessageRouter.delete('/:id', deleteChatMessage);
chatMessageRouter.get('/room/:roomId', getMessagesByRoom);

export default chatMessageRouter;
