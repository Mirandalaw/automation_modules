import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  setupFiles: ['<rootDir>/jest.setup.ts'], // dotenv 환경변수 로딩 추가
};

export default config;