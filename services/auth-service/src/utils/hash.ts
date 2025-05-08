import bcrypt from 'bcrypt';

/**
 * 비밀번호 해시화
 */
export const hashPassword = async (plain: string): Promise<string> => {
  return bcrypt.hash(plain, 10);
};

/**
 * 해시된 비밀번호와 평문 비교
 */
export const comparePassword = async (plain: string, hashed: string): Promise<boolean> => {
  return bcrypt.compare(plain, hashed);
};