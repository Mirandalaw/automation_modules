import express from 'express';
import { authenticate } from '../middleware/authenticate';
import { createServiceProxy } from '../proxy';
import logger from '../utils/logger';

const router = express.Router();

const { AUTH_SERVICE_URL, USER_SERVICE_URL } = process.env;

if (!AUTH_SERVICE_URL || !USER_SERVICE_URL) {
  console.error('서비스 URL이 설정되지 않았습니다. .env 파일을 확인하세요.');
  process.exit(1); // 명확하게 프로세스 종료
}

logger.info('API Gateway 라우팅 초기화 완료');

// 인증 없이 접근 가능한 경로
router.use('/auth', createServiceProxy(AUTH_SERVICE_URL));

// JWT 인증이 필요한 경로
router.use('/user', authenticate, createServiceProxy(USER_SERVICE_URL));

export default router;