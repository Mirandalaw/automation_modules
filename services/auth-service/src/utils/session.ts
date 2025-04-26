import { Session } from '../types/session';
import { v4 as uuidv4 } from 'uuid';

/**
 * 새로운 세션을 생성하는 함수
 * @param userId
 * @param userAgent
 * @param ipAddress
 */
export const createSession = (userId: string, userAgent: string, ipAddress: string): Session => {
  const now = new Date();
  const expiredAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7); // 7일 후 만료

  return {
    id: uuidv4(),
    userId,
    userAgent,
    ipAddress,
    isValid: true,
    createdAt: now,
    updatedAt: now,
    expiredAt,
  };
};

/**
 * 세션을 갱신하는 함수
 * @param session
 */
export const refreshSession = (session: Session): Session => {
  const now = new Date();
  return {
    ...session,
    updatedAt: now,
  };
};

/**
 * 세션을 무효화하는 함수 (로그아웃 시 사용)
 * @param session
 */
export const invalidateSession = (session: Session): Session => {
  return {
    ...session,
    isValid: false,
    updatedAt: new Date(),
  };
};
