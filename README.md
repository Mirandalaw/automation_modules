이 프로젝트는 실전 배포 수준의 인증 서비스를 직접 구현하고, **MSA 아키텍처 기반**으로 구조화한 경험을 담고 있습니다. 실무에서 바로 활용 가능한 수준의 설계, 보안 처리, API 응답 포맷, 로깅, 확장성 등을 모두 고려하여 완성도 있게 구성했습니다.

### ✅ 인증 로직 구현 완성도
- JWT 기반 Access / Refresh Token 분리 및 재발급
- 이메일 인증코드 및 비밀번호 재설정 로직 구현
- Google 소셜 로그인 도입 (OAuth2)
- RefreshToken에 `userAgent`, `ip` 저장 → 로그인 이력 보안 강화

### ✅ MSA 아키텍처 설계 경험
- 인증 서비스(`auth-service`)와 사용자 서비스(`user-service`) 분리
- API Gateway(`gateway`)로 모든 요청을 단일 Entry Point에서 관리
- 서비스 간 독립성 확보 및 확장 고려 (도커 기반 배포 포함)

### ✅ 보안 및 실무 고려
- RefreshToken 이중 저장 (Redis + DB)
- 인증 미들웨어로 API 접근 제어
- rate-limit, logger, error-handler 등을 서비스별 모듈로 구성

### ✅ 협업 및 유지보수 고려
- DTO 기반 요청 유효성 검증
- 커스텀 에러 구조화, 일관된 API 응답 포맷
- 서비스별 `.env` 환경 파일 분리 및 Docker 통합 배포 준비

> 위 프로젝트는 **실제 서비스 배포 및 운영을 목표**로 구성되었으며, 차후 CI/CD, Swagger, Naver/Kakao 소셜 로그인 등으로 확장 예정입니다.

---

# 🔐 Auth Service (Authentication & Authorization Microservice)

인증과 인가를 책임지는 마이크로서비스입니다. JWT 기반 인증, Refresh Token 재발급, 소셜 로그인, 비밀번호 재설정 등 사용자 인증 전반을 담당합니다.

본 프로젝트는 **MSA 기반 구조**로 설계되었으며, 하위 서비스로 `auth-service`, `user-service`, 그리고 이를 연결하는 `api-gateway`를 포함하고 있습니다.

---

## 🧩 전체 서비스 구성 (MSA 기반)

```
automation_modules/
├── services/
│   ├── auth-service/     # 인증/인가 관련 로직
│   ├── user-service/     # 유저 정보, 마이페이지 등 유저 도메인 분리
├── gateway/              # API Gateway: 서비스별 라우팅, 인증 미들웨어 관리
├── docker-compose.yml    # 전체 서비스 통합 구동
```

---

## 🛠 기술 스택

- **언어**: TypeScript
- **서버**: Express.js
- **ORM**: TypeORM (v0.3.x)
- **DB**: PostgreSQL
- **캐시**: Redis (ioredis)
- **인증**: JWT, OAuth2 (Google)
- **보안**: bcrypt, Rate Limiting, RefreshToken에 userAgent/ip 기록
- **메일**: Nodemailer (SendGrid 전환 예정)
- **배포**: Docker, Docker Compose
- **아키텍처**: MSA (Microservices Architecture)

---

## ✅ 구현된 기능

| 서비스 | 기능 | 설명 |
|--------|------|------|
| auth-service | 회원가입 / 로그인 | bcrypt로 비밀번호 암호화, 중복 이메일 검사 |
| auth-service | JWT 인증 | Access / Refresh Token 분리 및 재발급 |
| auth-service | 이메일 인증 코드 전송 | Redis에 저장 후 5분 유효 |
| auth-service | 비밀번호 재설정 | 인증코드 검증 후 비밀번호 재설정 |
| auth-service | 아이디(이메일) 찾기 | 이름+전화번호로 이메일 마스킹 반환 |
| auth-service | 소셜 로그인 (Google) | 최초 로그인 시 자동 가입, 이후 자동 로그인 |
| auth-service | RefreshToken 관리 | Redis + DB 동시 저장, userAgent 및 IP 기록 |
| user-service | 마이페이지 조회 | JWT 기반으로 내 정보(`/me`) 확인 |
| gateway | 인증 미들웨어 | JWT 토큰 검증 후 x-user-id 헤더 전달 |
| gateway | 프록시 라우팅 | /auth → auth-service, /user → user-service로 프록시 |

---

## 📁 폴더 구조 (auth-service 기준)

```bash
src/
├── controller/        # 각 기능 컨트롤러
├── service/           # 핵심 비즈니스 로직
├── middleware/        # 인증, 에러, 로깅, 속도제한 등
├── routes/            # Express 라우터 정의
├── entities/          # TypeORM 엔티티 (User, Token 등)
├── dto/               # 입력값 검증용 DTO 클래스
├── utils/             # JWT, Redis, Mail, Logger 등 유틸
├── configs/           # DB 및 환경 설정
├── index.ts           # App 미들웨어 및 라우팅 설정
└── server.ts          # App 실행 진입점
```

---

## ⚙️ 실행 방법 (auth-service 기준)

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정 (.env)
SERVICE_PORT=4000
DB_HOST=postgres-db
DB_PORT=5432
DB_USERNAME=youruser
DB_PASSWORD=yourpassword
DB_NAME=authdb
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
MAIL_USER=...
MAIL_PASS=...

# 3. 서버 실행
npm run dev
```

---

## 🐳 Docker 기반 실행

```bash
# 전체 서비스 통합 실행
$ docker compose up --build

# 종료
$ docker compose down
```

각 서비스는 독립된 Dockerfile과 `.env`를 가지고 있으며, 통합된 docker-compose로 실행됩니다.

---

## 🔐 JWT 구성

- **Access Token**: 짧은 수명 (15분 ~ 1시간)
- **Refresh Token**: 7일 보관 (Redis + DB)
- **userAgent & IP 기록**으로 보안 강화
- **Gateway 인증 미들웨어**는 x-user-id를 헤더에 담아 각 서비스로 전달

---

## 🔮 앞으로 구현할 기능

- [ ] Kakao / Naver 소셜 로그인 확장
- [ ] 비밀번호 변경 이력 확인 및 재사용 방지
- [ ] MFA (2차 인증) 적용
- [ ] Role 기반 권한 시스템 (JWT에 roles 포함)
- [ ] Swagger 기반 API 문서화
- [ ] CI/CD 자동화 (GitHub Actions)

---

## 📌 기술적 포인트 요약

- TypeORM v0.3+ 기반 DataSource 방식 구성
- MSA 구조에서 인증 도메인을 auth-service로 분리하여 SRP 유지
- RefreshToken을 Redis + DB에서 이중 관리 (만료/강제 로그아웃 구현 가능)
- Passport 기반 Google OAuth 로그인 구현 (소셜 계정 관리 테이블 활용)
- API Gateway에서 인증/프록시 역할 분리
- Logger(Winston), 미들웨어, 유틸, DTO, 에러 처리 등 공통 구조 통일화

---

## 🧑‍💻 작성자

- 이메일: shrup5@naver.com

