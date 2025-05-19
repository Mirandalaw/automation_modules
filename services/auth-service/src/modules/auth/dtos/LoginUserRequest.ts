
export interface LoginUserRequest {
  email: string;           // 사용자 이메일
  password: string;        // 사용자 비밀번호
  userAgent: string;       // 클라이언트의 User-Agent
  ip: string;              // 클라이언트 IP 주소
}