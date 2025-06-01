import { format, transports } from 'winston';

/**
 * 콘솔 로그 출력 정의
 * - 개발 환경: 컬러 출력 + 상세 포맷
 * - 운영 환경: 단순 출력
 */
export const consoleTransport = new transports.Console({
  format: process.env.NODE_ENV === 'production'
    ? format.simple()
    : format.combine(
      format.colorize(),
      format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] ${level}: ${message}`;
      })
    ),
});

/**
 * 파일 로그 출력 정의
 * - error.log: 에러 전용 로그
 * - combined.log: 모든 로그 통합 저장
 */
export const fileTransports = [
  new transports.File({ filename: 'logs/error.log', level: 'error' }),
  new transports.File({ filename: 'logs/combined.log' })
];