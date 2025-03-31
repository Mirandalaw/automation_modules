import express from 'express';
import { authenticate } from '../middleware/authenticate';
import { createServiceProxy } from '../proxy';

const router = express.Router();

if (!process.env.AUTH_SERVICE_URL || !process.env.USER_SERVICE_URL) {
  throw new Error('❌ 서비스 URL이 설정되지 않았습니다 (.env 확인)');
}
// ✅ 인증 서비스는 인증 없이 바로 프록시 연결 (회원가입, 로그인, 재발급 등)
router.use('/auth', createServiceProxy(process.env.AUTH_SERVICE_URL!));

// ✅ 유저 서비스는 토큰 인증 필요
router.use('/user', authenticate, createServiceProxy(process.env.USER_SERVICE_URL!));

export default router;