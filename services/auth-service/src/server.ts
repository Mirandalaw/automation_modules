import app from './index';
// import { initializeSchedulers } from './schedulers';

// 전역 에러 핸들러 등록
process.on('unhandledRejection', (reason,promise) =>{
  console.error('[Unhandled Rejection]', reason);
  // Sentry 전송, Slack 알림 등 추가 기능 예정
});

process.on('uncaughtException',(error) =>{
  console.error('[Uncaught Exception]',error);
  // 심각한 경우 종료 후 PM2 or Docker 재시작 유도
  // process.exit(1);
});

const port = Number(process.env.SERVICE_PORT) || 3000;
app.listen(port, '0.0.0.0',() => {
  console.log(`Auth service running at http://localhost:${port}`);
  // initializeSchedulers();
});