// 공통 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Access/ Refresh Token 구조
export interface AuthTokenBundle {
  accessToken: string;
  refreshToken: string;
}

// user & token return 구조
export interface AuthWithUserResponseData {
  user: {
    uuid: string;
    name: string;
    email: string;
  };
  tokens: AuthTokenBundle;
}

export interface FindEmailResponseData {
  email : string;
}

// 응답 타입들
export type AuthWithUserResponse = ApiResponse<AuthWithUserResponseData>;
export type AuthTokenResponse = ApiResponse<AuthTokenBundle>;
export type MessageResponse = ApiResponse<null>;
export type FindEmailResponse = ApiResponse<FindEmailResponseData>;