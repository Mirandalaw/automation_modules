FROM node:18

WORKDIR /app

# 패키지 파일 복사 후 의존성 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사
COPY . .

EXPOSE 4000
# 앱 실행
CMD ["npm", "run", "start"]
