import bcrypt from 'bcryptjs';
import { User } from '../entities/User';
import { RefreshToken } from '../entities/RefreshToken';
import { Session } from '../entities/Session';
import { AppDataSource } from '../configs/data-source';
import { CustomError } from '../utils/CustomError';
import { SuccessResponse, ErrorResponse } from '../types/responseTypes';

import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

import { getRefreshToken, saveRefreshToken, deleteRefreshToken } from '../utils/redis';
import redis from '../utils/redis';
import { sendEmail } from '../utils/sendEmail';
import { RegisterUserDto } from '../dto/RegisterUserDto';
import { LoginDto } from '../dto/LoginDto';
import logger from '../utils/logger';
import { createSession } from '../utils/session';
import { AccessTokenPayload, RefreshTokenPayload } from '../types/jwt';


/**
 * 사용자 회원가입
 * - 이메일 중복 확인
 * - 비밀번호 암호화
 * - User, Session DB 저장
 * - 회원가입 즉시 세션 로그인
 * @param name 사용자 이름
 * @param email 사용자 이메일
 * @param password 사용자 비밀번호
 * @param phone 사용자 핸드폰 번호
 * @param userAgent 브라우저 및 디바이스 정보
 * @param ipAddress 클라이언트 IP 주소
 * @returns AccessToken, RefreshToken 반환
 * @throws CustomError 중복 이메일, 서버 오류
 */
export const registerUser = async ({ name, email, password, phone, }: RegisterUserDto, userAgent: string, ipAddress: string) => {
  const userRepository = AppDataSource.getRepository(User);
  const sessionRepository = AppDataSource.getRepository(Session);
  const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

  logger.info(`[RegisterUser] 요청 수신: email=${email}, ipAddress=${ipAddress}`);
  // 이메일 중복 체크
  const existingUser = await userRepository.findOne({ where: { email } });

  if (existingUser) {
    logger.warn(`[RegisterUser] 중복 이메일 : ${email}`);
    throw new CustomError(409, '이미 존재하는 이메일입니다.');
  }

  // 비밀번호 암호화
  const hashedPassword = await bcrypt.hash(password, 10);

  // 사용자 저장
  const newUser = userRepository.create({
    name,
    email,
    password: hashedPassword,
    phone,
  });

  try {
    await userRepository.save(newUser);
    logger.info(`[RegisterUser] 사용자 저장 완료: email=${email}`);
  } catch (error: any) {
    logger.error(`[RegisterUser] 사용자 저장 실패: ${(error as Error).message}`);
    if (error?.code === '23505') {
      throw new CustomError(409, '이미 사용 중인 값이 존재합니다.', error.detail);
    }
    if (error?.code === '23502') {
      throw new CustomError(400, '필수 항목이 누락되었습니다.', error.detail);
    }
    throw new CustomError(500, '회원가입 중 서버 오류 발생', error.message);
  }

  // 세션 생성
  const sessionData = createSession(newUser.uuid, userAgent, ipAddress);
  const session = sessionRepository.create({
    id: sessionData.id,
    user: newUser,
    userAgent: sessionData.userAgent,
    ipAddress: sessionData.ipAddress,
    isValid: sessionData.isValid,
    expiredAt: sessionData.expiredAt,
  });

  try {
    await sessionRepository.save(session);
    logger.info(`[RegisterUser] 세션 저장 완료: userId=${newUser.uuid}`);
  } catch (error) {
    logger.error(`[RegisterUser] 세션 저장 실패: ${(error as Error).message}`);
    throw new CustomError(500, '회원가입 중 세션 저장 오류');
  }

  const now = Math.floor(Date.now() / 1000);

  // AccessToken 발급
  const accessTokenPayload: AccessTokenPayload = {
    userId: newUser.uuid,
    roles: [],
    issuedAt: now,
    expiresAt: now + 60 * 15,
  };

  const accessToken = generateAccessToken(accessTokenPayload);
  logger.info(`[RegisterUser] AccessToken 발급 완료: userId=${newUser.uuid}`);

  // RefreshToken 발급
  const refreshTokenPayload: RefreshTokenPayload = {
    userId: newUser.uuid,
    sessionId: sessionData.id,
    userAgent,
    ipAddress,
    loginAt: now,
  };

  const refreshToken = generateRefreshToken(refreshTokenPayload);
  logger.info(`[RegisterUser] RefreshToken 발급 완료: userId=${newUser.uuid}`);

  // // RefreshToken DB + Redis 저장
  try {
    const tokenEntity = refreshTokenRepository.create({
      token: refreshToken,
      user: newUser,
      userAgent,
      ip: ipAddress,
      expiredAt: sessionData.expiredAt,
    });

    await refreshTokenRepository.save(tokenEntity);
    logger.info(`[RegisterUser] RefreshToken DB 저장 완료: userId=${newUser.uuid}`);

    await saveRefreshToken(newUser.uuid, {
      ...refreshTokenPayload,
      token: refreshToken,
      expiredAt: sessionData.expiredAt.getTime(),
    });
    logger.info(`[RegisterUser] RefreshToken Redis 저장 완료: userId=${newUser.uuid}`);
  } catch (error) {
    logger.error(`[RegisterUser] RefreshToken 저장 실패: ${(error as Error).message}`);
    throw new CustomError(500, '회원가입 중 토큰 저장 오류');
  }

  logger.info(`[RegisterUser] 전체 프로세스 완료: email=${email}`);

  return {
    success: true,
    message: '회원가입 성공',
    data: {
      accessToken,
      refreshToken,
    },
  };
};

/**
 * 사용자 로그인
 * - Seesion + Redis + RefreshToken 관리
 * @param email
 * @param password
 * @param userAgent
 * @param ipAddress
 */
export const loginUser = async ({ email, password, }: LoginDto, userAgent: string, ipAddress: string): Promise<SuccessResponse | ErrorResponse> => {
  const userRepository = AppDataSource.getRepository(User);
  const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
  const sessionRepository = AppDataSource.getRepository(Session);

  logger.info(`[LoginUser] 요청 수신: email=${email}, ipAddress=${ipAddress}`);

  // 사용자 조회
  const user = await userRepository.findOne({ where: { email }, relations: ['roles'] });
  if (!user) {
    logger.warn(`존재하지 않는 사용자: email=${email}`);
    throw new CustomError(404, '존재하지 않는 사용자입니다.');
  }

  if (!user.password) {
    logger.warn(`[LoginUser] 비밀번호 없는 소셜 로그인 전용 계정: email=${email}`);
    throw new CustomError(400, '비밀번호로 로그인할 수 없는 계정입니다.');
    }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    logger.warn(`[LoginUser] 비밀번호 불일치: email=${email}`);
    throw new CustomError(401, '비밀번호가 일치하지 않습니다.');
  }

  try{
    // 기존 세션 모두 무효화
    await sessionRepository.update({ user }, { isValid: false });
  }catch (error) {
    logger.error(`[LoginUser] 기존 세션 무효화 실패: ${(error as Error).message}`);
    throw new CustomError(500, '로그인 중 세션 초기화 오류');
  }

  // 새로운 세션 생성
  const sessionData = createSession(user.uuid, userAgent, ipAddress);
  const newSession = sessionRepository.create({
    id: sessionData.id,
    user,
    userAgent: sessionData.userAgent,
    ipAddress: sessionData.ipAddress,
    isValid: sessionData.isValid,
    expiredAt: sessionData.expiredAt,
  });

  try {
    await sessionRepository.save(newSession);
    logger.info(`[LoginUser] 새 세션 저장 완료: userId=${user.uuid}`);
  } catch (error) {
    logger.error(`[LoginUser] 새 세션 저장 실패: ${(error as Error).message}`);
    throw new CustomError(500, '로그인 중 세션 저장 오류');
  }

  // roles를 문자열로 배열로 반환 ( ['USER','ADMIN'] )
  const roles = user.roles?.map(role => role.name) || [];

  // AccessToken Payload
  const now = Math.floor(Date.now() / 1000); // 초
  const accessTokenPayload: AccessTokenPayload = {
    userId: user.uuid,
    roles,
    issuedAt: now,
    expiresAt: now + 60 * 15, // 15분
  };

  const accessToken = generateAccessToken(accessTokenPayload);
  logger.info(`[LoginUser] AccessToken 발급 완료: userId=${user.uuid}`);

  // RefreshToken Payload
  const refreshTokenPayload: RefreshTokenPayload = {
    userId: user.uuid,
    sessionId: sessionData.id,
    userAgent,
    ipAddress,
    loginAt: now,
  };

  const refreshToken = generateRefreshToken(refreshTokenPayload);
  logger.info(`[LoginUser] RefreshToken 발급 완료: userId=${user.uuid}`);
  
  try {
    const tokenEntitiy = refreshTokenRepository.create({
      token: refreshToken,
      user,
      userAgent,
      ip: ipAddress,
      expiredAt: sessionData.expiredAt,
    });

    await refreshTokenRepository.save(tokenEntitiy);

    // Redis 저장
    await saveRefreshToken(user.uuid, {
      ...refreshTokenPayload,
      token: refreshToken,
      expiredAt: sessionData.expiredAt.getTime(),
    });
    logger.info(`[loginUser] RefreshToken Redis 저장 완료: userId=${user.uuid}`);

  }catch (error) {
    logger.error(`[loginUser] RefreshToken 저장 실패: ${(error as Error).message}`);
    throw new CustomError(500, '로그인 중 토큰 저장 오류');
  }

  logger.info(`[loginUser] 전체 프로세스 완료: email=${email}`);

  return {
    success: true,
    message: '로그인 성공',
    data: {
      accessToken,
      refreshToken,
    },
  };
};

/**
 * AccessToken, RefreshToken 재발급
 * - Redis의 RefreshToken 검증
 * - DB(RefreshToken Entity) 업데이트
 * - 새 AccessToken, 새 RefreshToken 발급
 * - RefreshToken Rotation 적용
 * @param userId
 * @param clientRefreshToken
 */
export const reissueToken = async (userId: string, clientRefreshToken: string) => {
  const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
  const sessionRepository = AppDataSource.getRepository(Session);
  
  logger.info(`[ReissueToken] 요청 수신: userId=${userId}`);
  
  // 1. Redis에 저장된 RefreshToken 토큰 가져오기
  let stored;
  try {
    stored = await getRefreshToken(userId);
  } catch (error) {
    logger.error(`[ReissueToken] Redis 토큰 조회 실패: ${(error as Error).message}`);
    throw new CustomError(500, '토큰 재발급 중 서버 오류 발생');
  }

  // 저장된 토큰이 없거나, 클라이언트 토큰과 일치하지 않은 경우
  if (!stored || stored.token !== clientRefreshToken) {
    logger.warn(`[ReissueToken] 토큰 불일치 또는 만료: userId=${userId}`);
    throw new CustomError(403, '유효하지 않거나 만료된 토큰입니다.');
  }

  // 2. 세션 유효성 검증
  const session = await sessionRepository.findOne({
    where: { id: stored.sessionId, isValid: true },
  });

  if (!session) {
    logger.warn(`[ReissueToken] 유효하지 않은 세션: sessionId=${stored.sessionId}`);
    throw new CustomError(403, '유효하지 않은 세션입니다. 다시 로그인하세요.');
  }

  // 3. 기존 RefreshToken 무효화
  try{
    await deleteRefreshToken(userId); // Redis 삭제
    await refreshTokenRepository.delete({ token: clientRefreshToken }); // DB 삭제
    logger.info(`[ReissueToken] 기존 RefreshToken 무효화 완료: userId=${userId}`);
  }catch (error) {
    logger.error(`[ReissueToken] 기존 토큰 무효화 실패: ${(error as Error).message}`);
    throw new CustomError(500, '기존 토큰 무효화 중 오류 발생');
  }

  const now = Math.floor(Date.now() / 1000);

  // 4. 새 AccessToken 생성
  const accessTokenPayload: AccessTokenPayload = {
    userId,
    roles: [],
    issuedAt: now,
    expiresAt: now + 60 * 15,
  };

  const newAccessToken = generateAccessToken(accessTokenPayload);
  logger.info(`[ReissueToken] AccessToken 재발급 완료: userId=${userId}`);

  // 5. 새 RefreshToken 생성
  const refreshTokenPayload: RefreshTokenPayload = {
    userId,
    sessionId: stored.sessionId,
    userAgent: stored.userAgent,
    ipAddress: stored.ipAddress,
    loginAt: now,
  };

  const newRefreshToken = generateRefreshToken(refreshTokenPayload);
  logger.info(`[ReissueToken] RefreshToken 재발급 완료: userId=${userId}`);

  // 6. 새 RefreshToken Redis + DB 저장
  try{
    const refreshTokenEntity = refreshTokenRepository.create({
      token: newRefreshToken,
      user: { uuid: userId },
      userAgent: stored.userAgent,
      ip: stored.ipAddress,
      expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    });

    await refreshTokenRepository.save(refreshTokenEntity);
    logger.info(`[ReissueToken] RefreshToken DB 저장 완료: userId=${userId}`);

    await saveRefreshToken(userId, {
      ...refreshTokenPayload,
      token: newRefreshToken,
      expiredAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
    });
    logger.info(`[ReissueToken] RefreshToken Redis 저장 완료: userId=${userId}`);
  }catch (error){
    logger.error(`[ReissueToken] 새 토큰 저장 실패: ${(error as Error).message}`);
    throw new CustomError(500, '새 토큰 저장 중 서버 오류 발생');
  }

  logger.info(`[ReissueToken] 전체 프로세스 완료: userId=${userId}`);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

/**
 * 사용자 로그아웃
 * - Redis에서 RefreshToken 삭제
 * - DB(RefreshToken T)에서 삭제
 * @param clientRefreshToken
 */
export const logoutUser = async (clientRefreshToken: string): Promise<SuccessResponse | ErrorResponse> => {
  const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

  logger.info(`[LogoutUser] 요청 수신: clientRefreshToken=${clientRefreshToken}`);

  // 현재 토큰이 DB에 존재하는지
  const existingToken = await refreshTokenRepository.findOne({
    where: { token: clientRefreshToken },
    relations: ['user'],
  });

  if (!existingToken) {
    logger.warn('[LogoutUser] 존재하지 않는 토큰으로 로그아웃 시도');
    throw new CustomError(404, 'Refresh token not found.');
  }

  const userUUID = existingToken.user.uuid;

  // Redis에서 RefreshToken 삭제
  try {
    await deleteRefreshToken(userUUID);
    logger.info(`[LogoutUser] Redis에서 RefreshToken 삭제 완료: userId=${userUUID}`);
  } catch (error) {
    logger.error(`[LogoutUser] Redis RefreshToken 삭제 실패: ${(error as Error).message}`);
    throw new CustomError(500, '로그아웃 중 Redis 처리 오류 발생');
  }

  // DB에서 RefreshToken 삭제
  try {
    await refreshTokenRepository.delete({ token: clientRefreshToken });
    logger.info(`[LogoutUser] DB에서 RefreshToken 삭제 완료: userId=${userUUID}`);
  } catch (error) {
    logger.error(`[LogoutUser] DB RefreshToken 삭제 실패: ${(error as Error).message}`);
    throw new CustomError(500, '로그아웃 중 DB 처리 오류 발생');
  }

  logger.info(`[LogoutUser] 전체 프로세스 완료: userId=${userUUID}`);

  return {
    success: true,
    message: '로그아웃 성공',
  };
};


/**
 * 이름 + 전화번호로 사용자 찾기
 * @param name
 * @param phone
 */
export const findEmailUser = async (name: string, phone: string) => {
  const userRepo = AppDataSource.getRepository(User);

  logger.info(`[FindEmailUser] 요청 수신: name=${name}, phone=${phone}`);

  const user = await userRepo.findOne({ where: { name, phone } });

  if (!user) {
    logger.warn(`[FindEmailUser] 사용자 없음: name=${name}, phone=${phone}`);
    throw new CustomError(404, '일치하는 사용자를 찾을 수 없습니다.');
  }

  const maskedEmail = user.email.replace(/(.{2}).+(@.+)/, '$1****$2');
  logger.info(`[FindEmailUser] 이메일 조회 완료: maskedEmail=${maskedEmail}`);

  return { email: maskedEmail };
};

/**
 * 비밀번호 재설정 인증 코드 전송
 * - 사용자 이메일 존재 여부 확인 후 6자리 코드 전송 (Redis에 저장)
 * @param email
 */
export const sendResetCodeForUser = async (email: string) => {
  const userRepo = AppDataSource.getRepository(User);

  logger.info(`[SendResetCode] 요청 수신: email=${email}`);

  const user = await userRepo.findOne({ where: { email } });

  if (!user) {
    logger.warn(`[SendResetCode] 존재하지 않는 이메일: ${email}`);
    throw new CustomError(404, '존재하지 않는 이메일입니다.');
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6자리

  try {
    await redis.set(`reset:${email}`, code, 'EX', 300); // 5분 유효
    logger.info(`[SendResetCode] Redis 저장 완료: email=${email}`);
  } catch (error) {
    logger.error(`[SendResetCode] Redis 저장 실패: ${(error as Error).message}`);
    throw new CustomError(500, '비밀번호 재설정 코드 저장 중 오류 발생');
  }

  try {
    await sendEmail(email, '비밀번호 재설정 인증코드', `인증코드: ${code}`);
    logger.info(`[SendResetCode] 이메일 전송 완료: email=${email}`);
  } catch (error) {
    logger.error(`[SendResetCode] 이메일 전송 실패: ${(error as Error).message}`);
    throw new CustomError(500, '비밀번호 재설정 코드 이메일 전송 오류');
  }

  return { message: '인증코드를 이메일로 전송했습니다' };
};

/**
 * 비밀번호 재설정 인증 코드 검증
 * - 실패 3회 초과 시 인증 코드 삭제
 * - 실패 카운트 저장 및 관리
 * - 인증 성공 시 인증 완료 상태 저장
 * @param email 사용자 이메일
 * @param code 제출된 인증 코드
 */
export const verifyResetCodeForUser = async (email: string, code: string) => {
  logger.info(`[VerifyResetCode] 요청 수신: email=${email}`);

  const failCountKey = `reset:failcount:${email}`;

  // 실패 횟수 가져오기
  let failCount = 0;
  try {
    const storedCount = await redis.get(failCountKey);
    failCount = storedCount ? Number(storedCount) : 0;
  } catch (error) {
    logger.error(`[VerifyResetCode] Redis 실패 횟수 조회 실패: ${(error as Error).message}`);
    throw new CustomError(500, '서버 오류로 인증을 진행할 수 없습니다.');
  }

  if (failCount >= 5) {
    logger.warn(`[VerifyResetCode] 인증 시도 초과: email=${email}`);
    throw new CustomError(429, '인증 시도 횟수를 초과했습니다.');
  }

  // 인증 코드 가져오기
  let savedCode: string | null = null;
  try {
    savedCode = await redis.get(`reset:${email}`);
  } catch (error) {
    logger.error(`[VerifyResetCode] Redis 인증 코드 조회 실패: ${(error as Error).message}`);
    throw new CustomError(500, '서버 오류로 인증 코드 조회 실패');
  }

  if (!savedCode) {
    logger.warn(`[VerifyResetCode] 인증 코드 없음 또는 만료됨: email=${email}`);
    throw new CustomError(400, '인증 코드가 만료되었거나 존재하지 않습니다.');
  }

  // 인증 코드 불일치
  if (savedCode !== code) {
    try {
      await redis.incr(failCountKey);
      await redis.expire(failCountKey, 300); // 실패 횟수 5분간 유지

      const currentFailCount = await redis.get(failCountKey);

      if(currentFailCount && Number(currentFailCount >=3)) {
        await redis.del(`reset:${email}`); // 3회 실패 시 인증 코드 삭제
        logger.info(`[VerifyResetCode] 인증 실패 3회 초과 - 인증 코드 삭제: email=${email}`);
      }
      logger.info(`[VerifyResetCode] 인증 실패 횟수 증가: email=${email}`);
    } catch (error) {
      logger.error(`[VerifyResetCode] 실패 처리 중 Redis 오류: ${(error as Error).message}`);
    }

    logger.warn(`[VerifyResetCode] 인증 코드 불일치: email=${email}`);
    throw new CustomError(400, '인증 코드가 일치하지 않습니다.');
  }

  // 인증 성공 처리
  try {
    await redis.del(failCountKey);
    await redis.del(`reset:${email}`); // 성공한 경우에도 코드 삭제
    await redis.set(`reset:verified:${email}`, 'true', 'EX', 600); // 인증 완료 상태 저장 (10분 유효)
    logger.info(`[VerifyResetCode] 인증 성공 및 상태 저장 완료: email=${email}`);
  } catch (error) {
    logger.error(`[VerifyResetCode] 인증 성공 처리 중 Redis 오류: ${(error as Error).message}`);
    throw new CustomError(500, '인증 완료 처리 중 서버 오류 발생');
  }

  return { message: '인증이 완료되었습니다.' };
};

/**
 * 비밀번호 재설정
 * - 인증된 사용자 비밀번호를 새로 암호화하여 저장
 * @param email
 * @param code
 * @param newPassword
 */
export const resetPasswordUser = async (email: string, code: string, newPassword: string) => {
  logger.info(`[ResetPassword] 요청 수신: email=${email}`);

  let storedCode;
  try{
    storedCode = await redis.get(`reset:${email}`);
  }catch (error) {
    logger.error(`[ResetPassword] Redis 조회 실패: ${(error as Error).message}`);
    throw new CustomError(500, '비밀번호 재설정 중 서버 오류 발생');
  }

  if (!storedCode || storedCode !== code) {
    logger.warn(`[ResetPassword] 인증 코드 불일치 또는 없음: email=${email}`);
    throw new CustomError(400, '유효하지 않은 인증 코드입니다.');
  }

  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository.findOne({ where: { email } });
  if (!user) {
    logger.warn(`[ResetPassword] 사용자 없음: email=${email}`);
    throw new CustomError(404, '사용자를 찾을 수 없습니다.');
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  try{
    user.password = hashedPassword;
    await userRepository.save(user);
    logger.info(`[ResetPassword] 비밀번호 변경 완료: email=${email}`);
  } catch (error) {
    logger.error(`[ResetPassword] 비밀번호 저장 실패: ${(error as Error).message}`);
    throw new CustomError(500, '비밀번호 재설정 중 저장 오류 발생');
  }

  try{
    await redis.del(`reset:${email}`);
    await redis.del(`reset:verified:${email}`);
    logger.info(`[ResetPassword] 인증 코드 삭제 완료: email=${email}`);
  }catch (error) {
    logger.error(`[ResetPassword] 인증 코드 삭제 실패: ${(error as Error).message}`);
  }

  return { message: '비밀번호가 성공적으로 변경되었습니다' };
};
