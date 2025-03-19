export interface SuccessResponse {
  success: true;
  message: string;
  data?: any;  // 선택적 데이터
}

export interface ErrorResponse {
  success: false;
  message: string;
  errorDetails?: string;  // 선택적 에러 세부 사항
}
