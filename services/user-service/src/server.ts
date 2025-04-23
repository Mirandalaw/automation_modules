import app from './index';
import logger from './utils/logger';
import { AppDataSource } from './configs/data-source';

const PORT = process.env.PORT || 4001;

AppDataSource.initialize()
  .then(() => {
    logger.info('📦 Database connected');

    app.listen(PORT, () => {
      logger.info(`🚀 User-service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error('❌ Database connection failed:', error);
  });
