import app from './index';
import logger from './common/logger';
import {initializeLoaders} from './loaders';

const PORT = process.env.SERVICE_PORT || 4001;

initializeLoaders()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`[User-Service] 실행 중 - 포트: ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error('[User-Service] 시작 중 오류 발생:', error);
    process.exit(1);
  });
