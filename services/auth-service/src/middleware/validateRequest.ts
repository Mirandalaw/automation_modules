import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * 요청 body를 DTO 클래스로 변환하고 유효성 검증하는 미들웨어
 * @param DtoClass 검증할 DTO 클래스
 */
export const validateRequest = (DtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 요청 데이터를 DTO로 변환
      const dto = plainToInstance(DtoClass, req.body);

      // DTO에 대해 유효성 검사
      const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });

      if (errors.length > 0) {
        const messages = errors
          .flatMap(err => Object.values(err.constraints || {}))
          .join(', ');

        logger.warn(`[ValidateRequest] 유효성 검사 실패: ${messages}`);

        return res.status(400).json({
          success: false,
          message: '입력값 오류',
          details: messages,
        });
      }

      next();
    } catch (error) {
      logger.error(`[ValidateRequest] DTO 변환 또는 검증 중 에러: ${(error as Error).message}`);
      return res.status(500).json({
        success: false,
        message: '요청 검증 중 서버 오류가 발생했습니다.',
      });
    }
  };
};
