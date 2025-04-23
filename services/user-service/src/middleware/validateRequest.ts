import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response, NextFunction } from 'express';

export const validateRequest = (DtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(DtoClass, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const messages = errors
        .flatMap(err => Object.values(err.constraints || {}))
        .join(', ');
      return res.status(400).json({ message: '입력값 오류', details: messages });
    }

    next();
  };
};
