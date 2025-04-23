import app from './index';
import logger from './utils/logger';
import * as dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`🚀 API Gateway running on port ${PORT}`);
});
