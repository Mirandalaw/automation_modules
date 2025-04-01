import express from 'express';
import { login, register, logout,refresh } from '../controllers/auth.controller';
// ,findEmail,sendResetCode,resetPassword
import {validateRequest} from '../middleware/validateRequest';
import {RegisterUserDto} from '../dto/RegisterUserDto';

export const authRoutes = express.Router();

authRoutes.post('/register', validateRequest(RegisterUserDto),register);
authRoutes.post('/login', login);
authRoutes.post('/logout',logout);
authRoutes.post('/refresh',refresh);
// authRoutes.post('/find-email', findEmail);               // 아이디(이메일) 찾기
// authRoutes.post('/forgot-password', sendResetCode);      // 비밀번호 재설정 - 인증번호 전송
// authRoutes.post('/reset-password', resetPassword);       // 비밀번호 재설정 - 실제 변경

export default authRoutes;
