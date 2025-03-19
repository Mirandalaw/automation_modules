module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest',  // TypeScript 파일을 ts-jest로 처리
  },
  moduleFileExtensions: ['js', 'ts'],  // js, ts 파일을 처리하도록 설정
};
