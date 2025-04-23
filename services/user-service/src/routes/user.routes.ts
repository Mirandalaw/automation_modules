import express from 'express';
import { getMyPage } from '../controllers/user.controller';

const router = express.Router();

/**
 * @route GET /user/me
 * @desc 현재 로그인한 사용자 정보 조회
 * @access Private (JWT)
 */
router.get('/me', getMyPage);

export default router;
