import express from 'express';
import { login, register, logout,refresh ,findEmail,sendResetCode,resetPassword} from '../controllers/auth.controller';

export const authRoutes = express.Router();

authRoutes.post('/login', login);
authRoutes.post('/register', register);
authRoutes.post('/logout',logout);
authRoutes.post('/refresh',refresh);
authRoutes.post('/find-email', findEmail);               // 아이디(이메일) 찾기
authRoutes.post('/forgot-password', sendResetCode);      // 비밀번호 재설정 - 인증번호 전송
authRoutes.post('/reset-password', resetPassword);       // 비밀번호 재설정 - 실제 변경

export default authRoutes;
