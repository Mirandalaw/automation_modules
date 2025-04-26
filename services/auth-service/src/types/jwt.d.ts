/**
 * AccessToken의 Payload 구조
 * - 사용자의 인증 정보를 담고 있으며
 * - 요청 시 토큰을 통해 사용자를 식별할 때 사용
 */
export interface AccessTokenPayload {
  userId: string;           // 사용자 UUID
  roles: string[];          // (선택) 권한 목록 (예: ['user', 'admin'])
  issuedAt: number;         // 발급 시간 (Issued At)
  expiresAt: number;        // 만료 시간 (Expiration)
}

/**
 * RefreshToken에 저장할 Payload 타입
 * - 사용자와 디바이스 식별을 위한 다양한 정보 포함
 */
export interface RefreshTokenPayload {
  userId: string;         // 사용자 UUID (고정)
  sessionId: string;      // 세션 ID (하나의 로그인 세션 식별)
  userAgent: string;      // 브라우저 및 디바이스 정보 (ex: Chrome on Windows)
  ipAddress: string;      // 접속한 클라이언트 IP 주소
  loginAt: number;        // 로그인 시각 (timestamp, 예: Date.now())

  deviceId?: string;      // (선택) 디바이스 고유 ID (앱에서 수집 가능)
  platform?: string;      // (선택) 플랫폼 (ex: ios, android, web 등)
  location?: string;      // (선택) 로그인 시 위치 정보 (ex: 서울시 강남구)
  version?: string;       // (선택) 클라이언트 앱 버전 (ex: 1.0.0)
}



