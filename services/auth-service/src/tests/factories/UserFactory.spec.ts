import { UserFactory } from '../../factories/UserFactory';
import { RegisterUserDto } from '../../dtos/RegisterUserDto';
import * as hashModule from '../../common/utils/hash';
import { User } from '../../entities/User';

jest.mock('../../common/utils/hash'); // 해시 함수 mocking

describe('UserFactory', () => {
  const mockHashedPassword = 'hashed-password-123';

  beforeEach(() => {
    (hashModule.hashPassword as jest.Mock).mockResolvedValue(mockHashedPassword);
  });

  it('회원가입 DTO를 기반으로 User 엔티티를 생성해야 한다', async () => {
    const dto: RegisterUserDto = {
      name: '홍길동',
      email: 'test@example.com',
      password: 'plain-password',
      phone: '010-1234-5678',
      agreedToPrivacyPolicy: true,
    };

    const user: User = await UserFactory.createWithHashedPassword(dto);

    expect(user.name).toBe(dto.name);
    expect(user.email).toBe(dto.email);
    expect(user.password).toBe(mockHashedPassword); // 해시된 비밀번호
    expect(user.phone).toBe(dto.phone);
    expect(user.agreedToPrivacyPolicy).toBe(true);
    expect(user.privacyAgreementDate).toBeInstanceOf(Date);
    expect(user.privacyAgreementExpireAt).toBeInstanceOf(Date);
  });

  it('개인정보 약관 동의 안 한 경우, 관련 필드는 null이어야 한다', async () => {
    const dto: RegisterUserDto = {
      name: '이몽룡',
      email: 'lee@test.com',
      password: 'no-agree-pass',
      phone: '010-1231-1231',
      agreedToPrivacyPolicy: false,
    };

    const user: User = await UserFactory.createWithHashedPassword(dto);

    expect(user.agreedToPrivacyPolicy).toBe(false);
    expect(user.privacyAgreementDate).toBeNull();
    expect(user.privacyAgreementExpireAt).toBeNull();
  });
});