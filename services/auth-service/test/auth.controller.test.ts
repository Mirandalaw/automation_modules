import request from 'supertest';
import express from 'express';
import { register, login } from '../src/controllers/auth.controller';
import resHandler from '../src/utils/resHandler'; // 기본 export로 사용

jest.mock('../src/services/auth.service');
jest.mock('../src/utils/resHandler');  // jest.fn()으로 mock 처리

describe('AuthController', () => {
  const app = express();
  app.use(express.json());
  app.post('/register', register);
  app.post('/login', login);

  it('should register a user successfully', async () => {
    // Mock the success response from the service
    (resHandler as jest.Mock).mockImplementation((res, statusCode, message) => {
      return res.status(statusCode).json({ message });
    });

    const response = await request(app)
      .post('/register')
      .send({ username: 'john', email: 'john@example.com', password: 'password123' });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully!');
  });

  it('should return error on registration failure', async () => {
    // Mock the error response from the service
    (resHandler as jest.Mock).mockImplementation((res, statusCode, message, error) => {
      return res.status(statusCode).json({ message, error });
    });

    const response = await request(app)
      .post('/register')
      .send({ username: 'john', email: 'john@example.com', password: 'password123' });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Server error');
  });

  it('should login a user successfully', async () => {
    (resHandler as jest.Mock).mockImplementation((res, statusCode, message) => {
      return res.status(statusCode).json({ message });
    });

    const response = await request(app)
      .post('/login')
      .send({ username: 'john', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful');
  });

  it('should return error if login credentials are invalid', async () => {
    (resHandler as jest.Mock).mockImplementation((res, statusCode, message) => {
      return res.status(statusCode).json({ message });
    });

    const response = await request(app)
      .post('/login')
      .send({ username: 'john', password: 'wrongpassword' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });
});
