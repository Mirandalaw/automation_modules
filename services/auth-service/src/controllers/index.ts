import { RegisterController } from './RegisterController';
import { LoginController } from './LoginController';
import { ReissueTokenController } from './ReissueTokenController';
import { LogoutController } from './LogoutController';
import { FindEmailController } from './FindEmailController';
import { SendResetCodeController } from './SendResetCodeController';
import { VerifyResetCodeController } from './VerifyResetCodeController';
import { ResetPasswordController } from './ResetPasswordController';

import { RegisterUserUsecase } from '../use-cases/RegisterUserUsecase';
import { LoginUserUsecase } from '../use-cases/LoginUserUsecase';
import { ReissueTokenUsecase } from '../use-cases/ReissueTokenUsecase';
import { LogoutUserUsecase } from '../use-cases/LogoutUserUsecase';
import { FindEmailUsecase } from '../use-cases/FindEmailUsecase';
import { SendResetCodeUsecase } from '../use-cases/SendReseCodeUsecase';
import { VerifyResetCodeUsecase } from '../use-cases/VerfyResetCodeUsecase';
import { ResetPasswordUsecase } from '../use-cases/ResetPasswordUsecase';

import { UserRepository } from '../repositories/implementations/UserRepository';
import { SessionRepository } from '../repositories/implementations/SessionRepository';
import { DatabaseRefreshTokenRepository } from '../repositories/implementations/DatabaseRefreshTokenRepository';
import { RedisRefreshTokenRepository } from '../repositories/implementations/RedisRefreshTokenRepository';
import { ResetCodeRepository } from '../repositories/implementations/ResetCodeRepository';

import { JwtTokenIssuer } from '../providers/implementations/JwtTokenIssuer';
import { SendGridProvider } from '../providers/implementations/SendGridProvider';

import { AppDataSource } from '../configs/data-source';
import { User } from '../entities/User';
import { RefreshToken } from '../entities/RefreshToken';
import { TokenService } from '../services/token.service';
import { JwtProvider } from '../providers/implementations/JwtProvider';


// === Usecase 의존성 조립 ===
const userRepository = new UserRepository(AppDataSource.getRepository(User));
const sessionRepository = new SessionRepository();
const refreshTokenDbRepository = new DatabaseRefreshTokenRepository(AppDataSource.getRepository(RefreshToken));
const refreshTokenRedisRepository = new RedisRefreshTokenRepository();
const resetCodeRepository = new ResetCodeRepository();
const jwtTokenIssuer = new JwtTokenIssuer();
const jwtProvider = new JwtProvider();
const tokenService = new TokenService(jwtTokenIssuer, refreshTokenRedisRepository);
const mailProvider = new SendGridProvider();

// === Usecase 인스턴스 ===
const registerUserUsecase = new RegisterUserUsecase(userRepository, sessionRepository, refreshTokenDbRepository, tokenService);
const loginUserUsecase = new LoginUserUsecase(userRepository, sessionRepository, refreshTokenDbRepository, tokenService);
const reissueTokenUsecase = new ReissueTokenUsecase(userRepository, sessionRepository, refreshTokenDbRepository, tokenService, jwtProvider);
const logoutUserUsecase = new LogoutUserUsecase(sessionRepository, refreshTokenRedisRepository, refreshTokenDbRepository);
const findEmailUsecase = new FindEmailUsecase(userRepository);
const sendResetCodeUsecase = new SendResetCodeUsecase(userRepository, resetCodeRepository, mailProvider);
const verifyResetCodeUsecase = new VerifyResetCodeUsecase(resetCodeRepository);
const resetPasswordUsecase = new ResetPasswordUsecase(userRepository, resetCodeRepository);

// === Controller 인스턴스 ===
export const registerController = new RegisterController(registerUserUsecase);
export const loginController = new LoginController(loginUserUsecase);
export const reissueTokenController = new ReissueTokenController(reissueTokenUsecase);
export const logoutController = new LogoutController(logoutUserUsecase);
export const findEmailController = new FindEmailController(findEmailUsecase);
export const sendResetCodeController = new SendResetCodeController(sendResetCodeUsecase);
export const verifyResetCodeController = new VerifyResetCodeController(verifyResetCodeUsecase);
export const resetPasswordController = new ResetPasswordController(resetPasswordUsecase);
