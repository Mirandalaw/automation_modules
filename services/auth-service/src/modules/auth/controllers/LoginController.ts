import { Request, Response } from 'express';
import { LoginUserUsecase } from '../use-cases/LoginUserUsecase';
import { LoginUserDto } from '../dtos/LoginUserDto';

export class LoginController {
  constructor(private readonly loginUserUsecase: LoginUserUsecase) {}

  async handle(req: Request, res: Response) {
    const dto = req.body as LoginUserDto;
    const result = await this.loginUserUsecase.execute(dto);
    return res.status(200).json(result);
  }
}
