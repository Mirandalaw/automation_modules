import { Router } from 'express';
import {
  findEmailController,
  sendResetCodeController,
  verifyResetCodeController,
  resetPasswordController,
} from '../controllers';

const recoveryRouter = Router();

/**
 * @route   POST /recovery/find-email
 * @desc    이름과 전화번호로 이메일 찾기
 */
recoveryRouter.post('/recovery/find-email', findEmailController.handle.bind(findEmailController));

/**
 * @route   POST /recovery/send-reset-code
 * @desc    비밀번호 재설정을 위한 인증코드 이메일 전송
 */
recoveryRouter.post('/recovery/send-reset-code', sendResetCodeController.handle.bind(sendResetCodeController));

/**
 * @route   POST /recovery/verify-reset-code
 * @desc    전송된 인증코드 검증
 */
recoveryRouter.post('/recovery/verify-reset-code', verifyResetCodeController.handle.bind(verifyResetCodeController));

/**
 * @route   POST /recovery/reset-password
 * @desc    인증 후 새로운 비밀번호로 재설정
 */
recoveryRouter.post('/recovery/reset-password', resetPasswordController.handle.bind(resetPasswordController));

export default recoveryRouter;