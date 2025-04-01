import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import { authRoutes } from './routes/authRoutes';
import { connectDatabase } from './db/db';
import errorHandler from './middleware/errorHandler';
import { logger } from './middleware/logger';
import { globalLimiter } from './middleware/rateLimit';
import './utils/redis';


const app = express();

// TypeORM 연결
connectDatabase();

app.use(logger);
app.use(globalLimiter);
app.use(express.json());
app.use('/auth', authRoutes);

app.use(errorHandler);

export default app;
