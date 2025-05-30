import { ResetPasswordUsecase } from '../../use-cases/ResetPasswordUsecase';
import { IUserRepository } from '../../repositories/interfaces/IUserRepository';
import { IResetCodeRepository } from '../../repositories/interfaces/IResetCodeRepository';
import { mockDeep } from 'jest-mock-extended';
import * as hashUtil from '../../common/utils/hash';
import { CustomError } from '../../common/errors/CustomError';
import { HttpStatus } from '../../constants/httpStatus';

describe('ResetPasswordUsecase', () => {
  const userRepository = mockDeep<IUserRepository>();
  const resetCodeStore = mockDeep<IResetCodeRepository>();
  const usecase = new ResetPasswordUsecase(userRepository, resetCodeStore);

  const dto = {
    email: 'test@example.com',
    code: '123456',
    newPassword: 'newPassword123',
  };

  it('인증 코드가 일치하면 비밀번호를 재설정한다', async () => {
    const mockUser = { uuid: 'user-uuid', email: dto.email } as any;
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
    (resetCodeStore.find as jest.Mock).mockResolvedValue(dto.code);
    jest.spyOn(hashUtil, 'hashPassword').mockResolvedValue('hashed-password');

    await usecase.execute(dto);

    expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      password: 'hashed-password',
    }));
    expect(resetCodeStore.delete).toHaveBeenCalledWith(dto.email);
  });

  it('인증 코드가 일치하지 않으면 예외를 발생시킨다', async () => {
    (resetCodeStore.find as jest.Mock).mockResolvedValue('wrongcode');

    await expect(usecase.execute(dto)).rejects.toThrow(CustomError);
    await expect(usecase.execute(dto)).rejects.toMatchObject({
      statusCode: HttpStatus.BAD_REQUEST,
    });
  });

  it('사용자가 존재하지 않으면 예외를 발생시킨다', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

    await expect(usecase.execute(dto)).rejects.toThrow(CustomError);
    await expect(usecase.execute(dto)).rejects.toMatchObject({
      statusCode: HttpStatus.NOT_FOUND,
    });
  });
});
