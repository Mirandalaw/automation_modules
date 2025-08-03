import { Request, Response } from 'express';
import { RegisterUserUsecase } from '../use-cases/RegisterUserUsecase';
import { RegisterUserDto } from '../dtos/RegisterUserDto';
import { HttpStatus } from '../constants/httpStatus';
import resHandler from '../common/utils/resHandler';

/**
 * RegisterController
 * - 회원가입 요청을 처리하는 컨트롤러
 * - 클라이언트로부터 전달받은 정보를 기반으로 회원가입 비즈니스 로직 수행
 */
export class RegisterController {
  constructor(
    private readonly registerUserUsecase: RegisterUserUsecase,
  ) {}

  /**
   * handle()
   * - POST /auth/register 요청을 처리
   * - Request Body: RegisterUserDto (이름, 이메일, 비밀번호 등)
   * @param req Express Request 객체
   * @param res Express Response 객체
   * @returns 회원가입 성공 시 201 Created 응답, 실패 시 에러 응답
   */
  async handle(req: Request, res: Response) {
    try {
      // 1. 요청 DTO 파싱
      const dto = req.body as RegisterUserDto;

      // 2. 회원가입 비즈니스 로직 실행
      const result = await this.registerUserUsecase.execute(dto);

      // 3. 응답 반환
      return resHandler(res, HttpStatus.CREATED, '회원가입이 완료되었습니다.', result);
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      return resHandler(res, status, error.message, null, error.stack);
    }
  }
}
