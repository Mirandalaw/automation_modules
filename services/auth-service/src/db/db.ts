import { createConnection } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export const connectDatabase = async () => {
  try {
    await createConnection();
    console.log('Connected to PostgreSQL database');
  } catch (error) {
    console.error('Database connection error', error);
  }
};
