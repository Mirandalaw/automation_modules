import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import router from './routes';
import logger from './utils/logger';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  logger.info(`[Gateway Request] ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/', router);

export default app;