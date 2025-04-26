import logger from './logger';


/**
 * 디코딩만 수행하는 JWT Payload 추출 함수
 *
 * - 이 함수는 토큰의 유효성(서명, 만료 등)을 검증하지 않습니다.
 * - 디버깅 또는 비공식 데이터 조회용
 *
 * @param token JWT 문자열
 * @returns payload 객체 또는 null
 */
export const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token format.');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT structure.');
    }

    const payloadBase64 = parts[1];
    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadJson);

    if (typeof payload !== 'object' || payload === null) {
      throw new Error('Invalid payload format.');
    }

    return payload;
  } catch (error) {
    logger.warn('[decodeJwtPayload] Invalid token:', (error as Error).message);
    return null;
  }
};
