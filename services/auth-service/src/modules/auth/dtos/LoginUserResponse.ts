export interface LoginUserResponse {
  userId: string;          // 사용자 UUID
  accessToken: string;     // Access Token (JWT)
  refreshToken: string;    // Refresh Token (보통 Redis에 저장됨)
}