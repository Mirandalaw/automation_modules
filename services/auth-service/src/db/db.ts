import { AppDataSource } from '../configs/data-source';

export const connectDatabase = async () => {
  AppDataSource.initialize()
    .then(() => {
      console.log('Database connected successfully!');
    })
    .catch((error) => console.log('Database connection error:', error));
};
