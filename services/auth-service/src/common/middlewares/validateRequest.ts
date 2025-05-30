import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import { BadRequestException } from '../errors/BadRequestException';

/**
 * 요청 본문 유효성 검증 미들웨어
 * - class-validator로 DTO 유효성 검사 수행
 * - 실패 시 BadRequestException 발생
 */
export function validateRequest(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const instance = plainToInstance(dtoClass, req.body);

    const errors = await validate(instance, {
      whitelist: true,              // DTO에 정의된 값만 통과
      forbidNonWhitelisted: true,  // 정의되지 않은 값이 있으면 오류
    });

    if (errors.length > 0) {
      const messages = errors
        .flatMap(error => Object.values(error.constraints || {}))
        .join(', ');

      return next(
        new BadRequestException(messages, {
          path: req.originalUrl,
          reqId: req.headers['x-request-id'] as string,
        })
      );
    }

    return next();
  };
}
