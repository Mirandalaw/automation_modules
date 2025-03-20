import { User } from '../entities/User';
import { AppDataSource } from "../configs/data-source";
import bcrypt from 'bcrypt';
import { CustomError } from '../utils/CustomError';
import { SuccessResponse, ErrorResponse } from '../types/responseTypes';
import generateUUID from '../utils/uuid';

export const registerUser = async (username: string, email: string, password: string): Promise<SuccessResponse | ErrorResponse> => {
  const userRepository = AppDataSource.getRepository(User);

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = userRepository.create({
    // id : generateUUID,
    username,
    email,
    password: hashedPassword,
  });

  try {
    await userRepository.save(newUser);
    return { success: true, message: 'User registered successfully!' };
  } catch (error) {
    throw new CustomError(500, 'Server error during registration');
  }
};

export const loginUser = async (username: string, password: string): Promise<SuccessResponse | ErrorResponse> => {
  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository.findOne({ where: { username } });

  if (!user) {
    throw new CustomError(404, 'User not found');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new CustomError(401, 'Invalid credentials');
  }

  return { success: true, message: 'Login successful' };
};
