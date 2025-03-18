import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import bcrypt from 'bcrypt';
import User from '../entities/User' ;

// 회원가입 (비밀번호 암호화)
export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  const userRepository = getRepository(User);

  // 비밀번호 암호화
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = userRepository.create({
    username,
    email,
    password: hashedPassword,
  });

  try {
    await userRepository.save(newUser);
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// 로그인 (비밀번호 확인)
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const userRepository = getRepository(User);

  const user = await userRepository.findOne({ where: { username } });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // 비밀번호 확인
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  return res.status(200).json({ message: 'Login successful' });
};
