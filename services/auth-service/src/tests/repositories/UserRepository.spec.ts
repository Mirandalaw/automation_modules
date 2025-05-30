import { Repository } from 'typeorm';
import { mock, instance, when, verify, resetCalls, deepEqual } from 'ts-mockito';
import { UserRepository } from '../../repositories/implementations/UserRepository';
import { User } from '../../entities/User';

describe('UserRepository (with ts-mockito)', () => {
  let mockedRepo: Repository<User>;
  let repoMock: Repository<User>;
  let userRepository: UserRepository;

  const sampleUser: User = {
    uuid: 'user-uuid',
    email: 'test@example.com',
    name: '홍길동',
  } as User;

  beforeEach(() => {
    repoMock = mock<Repository<User>>();
    mockedRepo = instance(repoMock); // 실제 사용할 mock instance
    userRepository = new UserRepository(mockedRepo);
  });

  describe('findByEmail', () => {
    it('should return user if found', async () => {
      when(repoMock.findOne(deepEqual({ where: { email: 'test@example.com' } })))
        .thenResolve(sampleUser);

      const result = await userRepository.findByEmail('test@example.com');

      expect(result).toEqual(sampleUser);
      verify(repoMock.findOne(deepEqual({ where: { email: 'test@example.com' } }))).once();
    });

    it('should return null if user not found', async () => {
      when(repoMock.findOne(deepEqual({ where: { email: 'notfound@example.com' } })))
        .thenResolve(null);

      const result = await userRepository.findByEmail('notfound@example.com');

      expect(result).toBeNull();
      verify(repoMock.findOne(deepEqual({ where: { email: 'notfound@example.com' } }))).once();
    });
  });

  describe('findById', () => {
    it('should return user if found by ID', async () => {
      when(repoMock.findOne(deepEqual({ where: { uuid: 'user-uuid' } })))
        .thenResolve(sampleUser);

      const result = await userRepository.findById('user-uuid');

      expect(result).toEqual(sampleUser);
      verify(repoMock.findOne(deepEqual({ where: { uuid: 'user-uuid' } }))).once();
    });
  });

  afterEach(() => {
    resetCalls(repoMock);
  });
});
