import { v4 as uuidv4 } from 'uuid';

// UUID 생성 함수
const generateUUID = (): string => {
  /**
   *  v1: 타임스탬프(시간) 기준
   *  v3: MD5 해시 기준
   *  v4: 랜덤값 기반
   *  v5: SHA-1 해시 기준
   */

  const genUUID = uuidv4(); // uuidv4()를 실행하여 UUID 생성

  // UUID를 "-" 기준으로 분리
  const toStringUUID = genUUID.split("-");

  // 원하는 순서대로 UUID 조합 (예: 첫번째, 세번째, 두번째, 네번째 부분을 결합)
  return toStringUUID[0] + toStringUUID[2] + toStringUUID[1] + toStringUUID[3];
};

export default generateUUID();