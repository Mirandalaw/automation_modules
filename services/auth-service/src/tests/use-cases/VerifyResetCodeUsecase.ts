import { VerifyResetCodeUsecase} from '../../use-cases/VerfyResetCodeUsecase';
import { IResetCodeRepository } from '../../repositories/interfaces/IResetCodeRepository';
import { mockDeep } from 'jest-mock-extended';
import { CustomError } from '../../common/errors/CustomError';
import { HttpStatus } from '../../constants/httpStatus';
import { VerifyResetCodeDto } from '../../dtos/VerifyResetCodeDto';

describe('VerifyResetCodeUsecase', () => {
  const resetCodeRepository = mockDeep<IResetCodeRepository>();
  const usecase = new VerifyResetCodeUsecase(resetCodeRepository);

  const dto: VerifyResetCodeDto = {
    email: 'test@example.com',
    code: '123456',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('저장된 코드와 일치하면 검증 성공', async () => {
    (resetCodeRepository.find as jest.Mock).mockResolvedValue('123456');

    const result = await usecase.execute(dto);

    expect(result.success).toBe(true);
    expect(result.message).toContain('확인');
  });

  it('저장된 코드가 없으면 예외 발생', async () => {
    (resetCodeRepository.find as jest.Mock).mockResolvedValue(null);

    await expect(usecase.execute(dto)).rejects.toThrow(CustomError);
    await expect(usecase.execute(dto)).rejects.toMatchObject({
      statusCode: HttpStatus.BAD_REQUEST,
    });
  });

  it('저장된 코드와 다르면 예외 발생', async () => {
    (resetCodeRepository.find as jest.Mock).mockResolvedValue('654321');

    await expect(usecase.execute(dto)).rejects.toThrow(CustomError);
    await expect(usecase.execute(dto)).rejects.toMatchObject({
      statusCode: HttpStatus.BAD_REQUEST,
    });
  });
});
