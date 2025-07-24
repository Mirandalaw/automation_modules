import { Request } from 'express';

/**
 * 클라이언트 IP를 방어적으로 추출합니다.
 * - x-forwarded-for -> req.ip -> socket.remoteAddress 순서
 */

export function extractIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

/**
 * 클라이언트 User-Agent를 추출합니다.
 */

export function extractUserAgent(req: Request): string {
  return req.headers['user-agent'] || 'unknown';
}