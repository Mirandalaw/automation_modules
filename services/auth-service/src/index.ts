import express from 'express';
import { authRoutes } from './routes/authRoutes';
import { connectDatabase } from './db/db';

const app = express();
const port = process.env.SERVICE_PORT || 3000;

// TypeORM 연결
connectDatabase();

app.use(express.json());
app.use('/auth', authRoutes);

app.listen(port, () => {
  console.log(`Auth service running at http://localhost:${port}`);
});
