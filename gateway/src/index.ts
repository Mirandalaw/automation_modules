import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import router from './routes';
import { requestLogger } from './middleware/requestLogger';
import errorHandler from './middleware/errorHandler';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

app.use('/api', router);
app.use(errorHandler);
export default app;