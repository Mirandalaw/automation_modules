import fs from 'fs';
import path from 'path';

/**
 * 로그 디렉토리 존재 여부 확인 및 없을 경우 생성
 * @param dir 기본값은 logs/
 */
export function ensureLogDirectory(dir = 'logs') {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}