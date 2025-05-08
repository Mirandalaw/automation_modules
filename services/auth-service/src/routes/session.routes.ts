import express from 'express';
import { getSessions, deleteSession, deleteAllSessions } from '../controllers/session.controller';
import { validateSession } from '../middleware/validateSession';

export const sessionRoutes = express.Router();

/**
 * @route   GET /auth/sessions
 * @desc    현재 로그인한 사용자의 모든 세션 조회
 */
sessionRoutes.get('/', validateSession, getSessions);

/**
 * @route   DELETE /auth/sessions/:sessionId
 * @desc    특정 세션 무효화 (로그아웃)
 */
sessionRoutes.delete('/:sessionId', validateSession, deleteSession);

/**
 * @route   DELETE /auth/sessions
 * @desc    모든 세션 무효화 (전체 로그아웃)
 */
sessionRoutes.delete('/', validateSession, deleteAllSessions);

export default sessionRoutes;
