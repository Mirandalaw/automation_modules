import { Router } from 'express';
import { userGradeController } from '../controllers';

const router = Router();

/**
 * @route   GET /user/me/grade
 * @desc    사용자 등급 및 다음 등급 조건 조회
 */
router.get('/', userGradeController.handle.bind(userGradeController));

export default router;
