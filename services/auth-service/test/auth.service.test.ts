import { registerUser, loginUser } from '../src/services/auth.service';
import { CustomError } from '../src/utils/CustomError';
import { AppDataSource } from '../src/configs/data-source';
import bcrypt from 'bcrypt';
import { User } from '../src/entities/User';

describe('AuthService', () => {
  let mockSave: jest.Mock;
  let mockFindOne: jest.Mock;

  beforeEach(() => {
    mockSave = jest.fn();
    mockFindOne = jest.fn();

    // 최신 Jest 문법 사용하여 AppDataSource.getRepository() Mocking
    jest.spyOn(AppDataSource, 'getRepository').mockReturnValue({
      save: mockSave,
      findOne: mockFindOne,
      create: jest.fn().mockImplementation((user) => user), // create()도 Mocking
    } as any);

    // bcrypt 모듈의 특정 메서드만 Mocking
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
  });

  afterEach(() => {
    jest.restoreAllMocks(); // 모든 spyOn mock을 원래대로 복구
  });

  it('should register a user successfully', async () => {
    mockSave.mockResolvedValueOnce(true); // Simulating successful user save

    const result = await registerUser('john', 'john@example.com', 'password123');

    expect(result.success).toBe(true);
    expect(result.message).toBe('User registered successfully!');
    expect(mockSave).toHaveBeenCalledTimes(1); // Ensure save is called
  });

  it('should throw an error if user registration fails', async () => {
    mockSave.mockRejectedValueOnce(new Error('Database error')); // Simulating failure

    await expect(registerUser('john', 'john@example.com', 'password123')).rejects.toThrowError(CustomError);
  });

  it('should login a user successfully', async () => {
    mockFindOne.mockResolvedValueOnce({ username: 'john', password: 'hashedPassword' });

    const result = await loginUser('john', 'password123');

    expect(result.success).toBe(true);
    expect(result.message).toBe('Login successful');
  });

  it('should throw an error if user is not found during login', async () => {
    mockFindOne.mockResolvedValueOnce(null); // Simulating user not found

    await expect(loginUser('john', 'password123')).rejects.toThrowError(CustomError);
  });

  it('should throw an error if credentials are invalid during login', async () => {
    mockFindOne.mockResolvedValueOnce({ username: 'john', password: 'hashedPassword' });
    jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false as never); // Simulating invalid password

    await expect(loginUser('john', 'wrongPassword')).rejects.toThrowError(CustomError);
  });
});
