import request from 'supertest';
import express from 'express';
import { register, login } from '../src/controllers/auth.controller';
import * as authService from '../src/services/auth.service'; // Named import for Jest spyOn
import resHandler from '../src/utils/resHandler'; // default export 사용

// ✅ resHandler를 Mocking하여 Jest가 올바르게 인식하도록 수정
jest.mock('../src/utils/resHandler', () => ({
  __esModule: true,
  default: jest.fn((res: any, statusCode: number, message: string) => {
    return res.status(statusCode).json({ message });
  }) as jest.MockedFunction<(res: any, statusCode: number, message: string) => any>,
}));

describe('AuthController', () => {
  const app = express();
  app.use(express.json());
  app.post('/register', register);
  app.post('/login', login);

  beforeEach(() => {
    // ✅ authService의 함수들을 Jest spyOn을 사용하여 Mocking
    jest.spyOn(authService, 'registerUser').mockResolvedValue({
      success: true,
      message: 'User registered successfully!',
    });

    jest.spyOn(authService, 'loginUser').mockResolvedValue({
      success: true,
      message: 'Login successful',
    });
  });

  afterEach(() => {
    jest.restoreAllMocks(); // ✅ 모든 Mock을 초기화하여 다른 테스트에 영향 방지
  });

  it('should register a user successfully', async () => {
    const response = await request(app)
      .post('/register')
      .send({ username: 'john', email: 'john@example.com', password: 'password123' });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully!');
  });

  it('should return error on registration failure', async () => {
    // ✅ registerUser가 실패하도록 Mock 설정
    jest.spyOn(authService, 'registerUser').mockRejectedValue(new Error('Server error'));

    const response = await request(app)
      .post('/register')
      .send({ username: 'john', email: 'john@example.com', password: 'password123' });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Server error');
  });

  it('should login a user successfully', async () => {
    const response = await request(app)
      .post('/login')
      .send({ username: 'john', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful');
  });

  it('should return error if login credentials are invalid', async () => {
    // ✅ loginUser가 실패하도록 Mock 설정
    jest.spyOn(authService, 'loginUser').mockRejectedValue(new Error('Invalid credentials'));

    const response = await request(app)
      .post('/login')
      .send({ username: 'john', password: 'wrongpassword' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });
});
