import { Request, Response } from 'express';
import { LoginUserUsecase } from '../use-cases/LoginUserUsecase';
import { LoginUserDto } from '../dtos/LoginUserDto';
import { extractIp, extractUserAgent } from '../common/utils/requestInfo';
import { plainToInstance } from 'class-transformer';
import resHandler from '../common/utils/resHandler';
import { validate } from 'class-validator';
import { HttpStatus } from '../constants/httpStatus';


export class LoginController {
  constructor(private readonly loginUserUsecase: LoginUserUsecase) {
  }

  async handle(req: Request, res: Response) {
    try {
      // 1. 유저 메타정보 추출
      const userAgent = extractUserAgent(req);
      const ip = extractIp(req);

      // 2. DTO 변환 + 유효성 검사
      const dtoInstance = plainToInstance(LoginUserDto, {
        ...req.body,
        userAgent,
        ip,
      });

      // 타입 캐스팅
      const dto:LoginUserDto = dtoInstance as LoginUserDto;

      const errors = await validate(dto);
      if (errors.length > 0) {
        const messages = errors
          .map(err => Object.values(err.constraints || {}).join(','))
          .join('; ');
        return resHandler(res, HttpStatus.BAD_REQUEST, '로그인 요청 유효성 검사 실패', null, messages);
      }

      // 3. 로그인 로직 실행

      const result = await this.loginUserUsecase.execute(dto);
      return resHandler(res, HttpStatus.OK, '로그인 성공', result);
    } catch (error: any) {
      return resHandler(
        res,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        error.message || '로그인 처리 중 오류',
        null,
        error.stack,
      );
    }
  }
}
