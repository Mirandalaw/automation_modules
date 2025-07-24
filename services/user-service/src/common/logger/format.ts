import { format } from 'winston';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const KST = 'Asia/Seoul';
/**
 * 로그 포맷 정의
 * - 타임스탬프 포함
 * - 에러 객체일 경우 스택 포함
 */
export const logFormat = format.combine(
  format.errors({ stack: true }),
  format((info) =>{
    info.timestamp = dayjs().tz(KST).format('YYYY-MM-DD HH:mm:ss');
    return info;
  })(),
  format.printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `[${timestamp}] ${level.toUpperCase()}: ${message}\n${stack}`
      : `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  })
);