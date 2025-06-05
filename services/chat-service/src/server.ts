import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { ChatGateway } from './modules/chat/gateways/chatGateway';
import { SendMessageUsecase } from './modules/chat/usecases/SendMessageUsecase';
import { InMemoryChatMessageRepository } from './modules/chat/repositories/implementations/InMemoryChatMessageRepository';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

// 의존성 주입 (임시)
const chatMessageRepo = new InMemoryChatMessageRepository();
const sendMessageUsecase = new SendMessageUsecase(chatMessageRepo);
const chatGateway = new ChatGateway(sendMessageUsecase);
chatGateway.initialize(io);

server.listen(3000, () => {
  console.log(' Server running ');
});
