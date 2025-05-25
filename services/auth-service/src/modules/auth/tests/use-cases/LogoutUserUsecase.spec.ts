import { ISessionRepository } from '../../repositories/interfaces/ISessionRepository';
import { IRefreshTokenStore } from '../../repositories/interfaces/IRefreshTokenStore';
import { IRefreshTokenRepository } from '../../repositories/interfaces/IRefreshTokenRepository';
import { LogoutUserUsecase } from '../../use-cases/LogoutUserUsecase';
import { MessageResponse } from '../../types/responseTypes';
import { LogoutUserDto } from '../../dtos/LogoutUserDto';

describe('LogoutUserUsecase',()=>{

  let sessionRepository: ISessionRepository;
  let refreshTokenStore: IRefreshTokenStore;
  let refreshTokenRepository: IRefreshTokenRepository;
  let usecase: LogoutUserUsecase;

  beforeEach(() => {
    sessionRepository = {
      invalidateAllByUserId: jest.fn(),
      save: jest.fn(),
      exists:jest.fn(),
    };

    refreshTokenStore = {
      delete: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    refreshTokenRepository = {
      delete: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    usecase = new LogoutUserUsecase(
      sessionRepository,
      refreshTokenStore,
      refreshTokenRepository
    );
  });
  it('정상적으로 로그아웃 처리해야 한다', async () => {
    const dto: LogoutUserDto = {
      userId: 'user-1234',
      sessionId: 'session-5678',
    };

    const result = await usecase.execute(dto);

    expect(sessionRepository.invalidateAllByUserId).toHaveBeenCalledWith(dto.userId);
    expect(refreshTokenStore.delete).toHaveBeenCalledWith(dto.userId);
    expect(refreshTokenRepository.delete).toHaveBeenCalledWith(dto.userId);

    const expected: MessageResponse = {
      success: true,
      message: '로그아웃이 완료되었습니다.',
      data: null,
    };

    expect(result).toEqual(expected);
  });
})