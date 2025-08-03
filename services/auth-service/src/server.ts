import app from './index';
import logger from './common/logger';
import { initializeLoaders } from './loaders';
// import { initializeSchedulers } from './schedulers';

process.on('unhandledRejection', (reason) => {
  logger.error('[Unhandled Rejection]', reason);
  // TODO: Sentry.captureException(reason);
  // TODO: Slack alert
});

process.on('uncaughtException', (error) => {
  logger.error('[Uncaught Exception]', error);
  // TODO: Sentry.captureException(error);
  // process.exit(1); // 심각한 경우 종료
});

const PORT = Number(process.env.SERVICE_PORT) || 3000;

initializeLoaders()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`[User-Service] 실행 중 - http://localhost:${PORT}`);
      // initializeSchedulers(); // 필요 시 사용
    });
  })
  .catch((error) => {
    logger.error('[User-Service] 초기화 실패', error);
    process.exit(1);
  });
