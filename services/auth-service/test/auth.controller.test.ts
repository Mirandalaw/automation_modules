import request from 'supertest';
import express from 'express';
import { authRoutes } from '../src/routes/authRoutes';

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Service', () => {
  it('should login successfully with valid credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ username: 'admin', password: 'password' });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful');
  });

  it('should return error for invalid credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ username: 'admin', password: 'wrongpassword' });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ username: 'newuser', password: 'password' });
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully');
  });
});
