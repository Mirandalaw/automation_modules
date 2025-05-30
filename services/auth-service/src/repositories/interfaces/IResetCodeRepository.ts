/**
 * IResetCodeRepository
 * 비밀번호 재설정용 인증 코드를 임시 저장/조회/삭제하는 저장소 인터페이스입니다.
 * 일반적으로 Redis에 저장되며, 인증 코드 유효기간(TTL)은 서버 설정에 따릅니다.
 */
export interface IResetCodeRepository {
  save(email: string, code: string, ttlSeconds?: number): Promise<void>;
  find(email: string): Promise<string | null>;
  delete(email: string): Promise<void>;
}