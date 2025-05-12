import {UserFactory} from '../factories/user.factory';
import {RegisterUserDto} from '../../../dto/RegisterUserDto';
import * as hashModule from '../../../utils/hash';

describe('UserFactory',()=>{
  const dto:RegisterUserDto = {
    name : '테스트유저',
    email : 'test@example.com',
    password : 'password',
    phone : '010-1234-5678',
    agreedToPrivacyPolicy: true,
  };

  beforeAll(()=>{
    jest.spyOn(hashModule, 'hashPassword').mockImplementation(async (password) =>`hashed-${password}`);
  });

  afterAll(()=>{
    jest.restoreAllMocks();
  });

  it('약관에 동의한 경우, 비밀번호 해시 및 날짜 설정을 포함한 User 객체를 생성해야 한다',async ()=>{
    const user = await UserFactory.createFromRegisterDto(dto);

    expect(user.name).toBe(dto.name);
    expect(user.email).toBe(dto.email);
    expect(user.password).toBe('hashed-password');
    expect(user.phone).toBe(dto.phone);
    expect(user.agreedToPrivacyPolicy).toBe(true);
    expect(user.privacyAgreementDate).toBeInstanceOf(Date);
    expect(user.privacyAgreementExpireAt).toBeInstanceOf(Date);
  });

  it('약관에 동의하지 않은 경우, 동의 날짜 관련 필드는 null로 설정되어야 한다',async ()=>{
    const noAgreeDto = {...dto,agreedToPrivacyPolicy: false};
    const user = await UserFactory.createFromRegisterDto(noAgreeDto);

    expect(user.agreedToPrivacyPolicy).toBe(false);
    expect(user.privacyAgreementDate).toBeNull();
    expect(user.privacyAgreementExpireAt).toBeNull();
  });
});