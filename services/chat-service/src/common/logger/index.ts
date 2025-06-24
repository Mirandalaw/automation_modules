import winston from 'winston';
import { consoleTransport, fileTransports } from './transports';
import { logFormat } from './format';
import { ensureLogDirectory } from './directory';

// 로그 디렉토리 존재 확인 및 생성
ensureLogDirectory();

/**
 * Winston Logger 인스턴스 생성
 * - 콘솔 및 파일 로그 출력
 * - 예외 및 비동기 오류 핸들러 포함
 */
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    consoleTransport,
    ...fileTransports,
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' }),
  ],
});

export default logger;