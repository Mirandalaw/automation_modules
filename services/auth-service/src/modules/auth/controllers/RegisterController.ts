import { Request, Response } from 'express';
import { RegisterUserUsecase } from '../use-cases/RegisterUserUsecase';
import { RegisterUserDto } from '../dtos/RegisterUserDto';
import { HttpStatus } from '../../../constants/httpStatus';
import resHandler from '../../../utils/resHandler';
import { extractIp, extractUserAgent } from '../../../utils/requestInfo';

/**
 * RegisterController
 * - 회원가입 요청을 처리하는 컨트롤러
 * - 클라이언트로부터 전달받은 정보를 기반으로 회원가입 비즈니스 로직 수행
 * - userAgent 및 IP 주소 정보를 함께 전달하여 보안 및 세션 식별에 활용
 */
export class RegisterController {
  constructor(
    private readonly registerUserUsecase: RegisterUserUsecase, // 회원가입 usecase 주입 (DI)
  ) {
  }

  /**
   * handle()
   * - POST /auth/register 요청을 처리
   * - Request Body: RegisterUserDto (이름, 이메일, 비밀번호 등)
   * - Request Header: user-agent (브라우저 정보)
   * - Request IP: 클라이언트 접속 IP
   *
   * @param req Express Request 객체
   * @param res Express Response 객체
   * @returns 회원가입 성공 시 201 Created 응답, 실패 시 에러 응답
   */
  async handle(req: Request, res: Response) {
    try {
      // 1. 요청 본문을 DTO로 변환
      const dto = req.body as RegisterUserDto;

      // 2. 보안 정보 추출 (클라이언트에서 보내지 않고 서버에서 추출)
      const  userAgent = extractUserAgent(req);
      const ip = extractIp(req);


      // 3. 회원가입 비즈니스 로직 실행
      const result = await this.registerUserUsecase.execute(dto, userAgent, ip);

      // 4. 응답 핸들러를 통한 일관된 성공 응답 반환
      return resHandler(res, HttpStatus.CREATED, '회원가입이 완료되었습니다.', result);
    } catch (error: any) {
      // 5. 예외 발생 시 통합 에러 응답 처리 (에러 로그 포함)
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      return resHandler(res, status, error.message, null, error.stack);
    }
  }
}
