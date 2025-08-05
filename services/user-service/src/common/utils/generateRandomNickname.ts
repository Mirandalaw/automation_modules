const adjectives = ['빠른', '귀여운', '멋진', '조용한', '용감한'];
const animals = ['호랑이', '여우', '토끼', '곰', '늑대'];

export const generateRandomNickname = (): string => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const suffix = Math.floor(1000 + Math.random() * 9000); // 4자리 랜덤 숫자
  return `${adj}${animal}${suffix}`;
};