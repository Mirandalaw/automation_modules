// 공통 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// 구체적 응답 타입
export interface AuthTokenBundle {
  accessToken: string;
  refreshToken: string;
}

export type AuthResponse = ApiResponse<AuthTokenBundle>;