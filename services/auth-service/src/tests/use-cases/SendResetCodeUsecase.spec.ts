import { SendResetCodeUsecase} from '../../use-cases/SendReseCodeUsecase';
import { IUserRepository } from '../../repositories/interfaces/IUserRepository';
import { IResetCodeRepository } from '../../repositories/interfaces/IResetCodeRepository';
import { IMailProvider } from '../../providers/interfaces/IMailProvider';
import { mockDeep } from 'jest-mock-extended';
import { CustomError } from '../../common/errors/CustomError';
import { HttpStatus } from '../../constants/httpStatus';
import { SendResetCodeDto } from '../../dtos/SendResetCodeDto';

describe('SendResetCodeUsecase', () => {
  const userRepository = mockDeep<IUserRepository>();
  const resetCodeRepository = mockDeep<IResetCodeRepository>();
  const mailProvider = mockDeep<IMailProvider>();

  const usecase = new SendResetCodeUsecase(
    userRepository,
    resetCodeRepository,
    mailProvider
  );

  const dto : SendResetCodeDto ={
    email : 'test@example.com',
  };

  const mockUser = {
    uuid: 'user-uuid',
    email :dto.email,
    name: '홍길동',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('존재하는 사용자에게 인증 코드를 정상 발송한다', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

    const result = await usecase.execute(dto);

    expect(resetCodeRepository.save).toHaveBeenCalledWith(
      dto.email,
      expect.stringMatching(/^\d{6}$/), // 6자리 숫자
      300
    );

    expect(mailProvider.sendMail).toHaveBeenCalledWith({
      to: dto.email,
      subject: expect.any(String),
      body: expect.stringContaining('인증 코드'),
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain('인증 코드');
  });

  it('존재하지 않는 이메일일 경우 예외를 던진다', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

    await expect(usecase.execute(dto)).rejects.toThrow(CustomError);
    await expect(usecase.execute(dto)).rejects.toMatchObject({
      statusCode: HttpStatus.NOT_FOUND,
    });
  });
});
