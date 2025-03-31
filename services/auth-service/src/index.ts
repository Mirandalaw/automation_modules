import express from 'express';
import { authRoutes } from './routes/authRoutes';
import { connectDatabase } from './db/db';
import errorHandler from './middleware/errorHandler';
import dotenv from 'dotenv';
import { logger } from './middleware/logger';
import { globalLimiter } from './middleware/rateLimit';

dotenv.config();

const app = express();

// TypeORM 연결
connectDatabase();

app.use(logger);
app.use(globalLimiter);
app.use(express.json());
app.use('/auth', authRoutes);

app.use(errorHandler);

export default app;
