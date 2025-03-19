import { registerUser, loginUser } from '../src/services/auth.service';
import { CustomError } from '../src/utils/CustomError';
import { getRepository } from 'typeorm';
import bcrypt from 'bcrypt';
import {User} from '../src/entities/User';

// mock getRepository and bcrypt
jest.mock('typeorm');
jest.mock('bcrypt');

describe('AuthService', () => {
  const mockSave = jest.fn();
  const mockFindOne = jest.fn();

  beforeEach(() => {
    // Mock getRepository and bcrypt methods
    (getRepository as jest.Mock).mockReturnValue({
      save: mockSave,
      findOne: mockFindOne,
    });
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false); // Simulating invalid password

    await expect(loginUser('john', 'wrongPassword')).rejects.toThrowError(CustomError);
  });
});
