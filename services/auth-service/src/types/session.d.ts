export interface Session {
  id: string;           // 세션 고유 ID (UUID)
  userId: string;       // 사용자 ID (UUID)
  userAgent: string;    // 접속한 브라우저 정보
  ipAddress: string;    // 접속한 IP 주소
  isValid: boolean;     // 세션 유효 여부 (로그아웃하면 false)
  createdAt: Date;      // 세션 생성 시간
  updatedAt: Date;      // 세션 갱신 시간
  expiredAt: Date;      // 세션 만료 시간
}
