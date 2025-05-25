import { FindEmailUsecase } from '../../use-cases/FindEmailUsecase';
import { IUserRepository } from '../../repositories/interfaces/IUserRepository';
import { mockDeep } from 'jest-mock-extended';
import { CustomError } from '../../../../utils/CustomError';
import { HttpStatus } from '../../../../constants/httpStatus';

describe('FindEmailUsecase', () => {
  const userRepository = mockDeep<IUserRepository>();
  const usecase = new FindEmailUsecase(userRepository);

  const name = '홍길동';
  const phone = '010-1234-5678';

  it('should return email if user is found', async () => {
    (userRepository.findByNameAndPhone as jest.Mock).mockResolvedValue({ email: 'test@example.com' } as any);

    const result = await usecase.execute({ name, phone });

    expect(result.success).toBe(true);
    expect(result.data.email).toBe('test@example.com');
  });

  it('should throw if user not found', async () => {
    (userRepository.findByNameAndPhone as jest.Mock).mockResolvedValue(null);

    await expect(usecase.execute({ name, phone })).rejects.toThrow(CustomError);
    await expect(usecase.execute({ name, phone })).rejects.toMatchObject({
      statusCode: HttpStatus.NOT_FOUND,
    });
  });
});
