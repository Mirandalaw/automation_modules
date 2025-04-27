import app from './index';
import logger from './utils/logger';

const PORT = process.env.PORT || 3000;

// 서버 시작
app.listen(PORT, () => {
  logger.info(`API Gateway 서버가 포트 ${PORT}번에서 정상적으로 실행 중입니다.`);
});

// 예외 처리
process.on('uncaughtException', (err) => {
  logger.error(`예기치 못한 예외 발생: ${err.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error(`처리되지 않은 프로미스 거부: ${reason}`);
  process.exit(1);
});
