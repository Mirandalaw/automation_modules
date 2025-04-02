# 🛡️ Auth Service

사용자 인증 및 권한 관리를 담당하는 마이크로서비스입니다. 회원가입, 로그인, 토큰 재발급, 로그아웃 등의 기능을 제공합니다.

---

## 📁 프로젝트 구조 (주요 폴더)

```
auth-service/
├── controllers/        # 요청 핸들링 (Express route handler)
├── services/           # 비즈니스 로직
├── utils/              # 헬퍼 함수, 로깅, 에러 처리 등
├── entities/           # TypeORM 엔티티 (User, RefreshToken)
├── dto/                # 요청 DTO 정의
├── configs/            # DB, Redis 설정 등
└── middleware/         # 요청 로깅 미들웨어 등
```

---

## 🚀 주요 기능

### ✅ 회원가입
- 이메일 중복 검사
- 비밀번호 해싱 (bcrypt)
- UUID 발급

### ✅ 로그인
- 이메일/비밀번호 검증
- JWT AccessToken & RefreshToken 발급
- Redis 및 DB에 RefreshToken 저장

### ✅ 토큰 재발급
- Redis에 저장된 토큰과 클라이언트 토큰 비교
- 새 AccessToken & RefreshToken 발급

### ✅ 로그아웃
- Redis & DB에서 RefreshToken 제거
- 클라이언트 쿠키 제거

---

## 🔐 보안 및 인증
- JWT (access/refresh) 사용
- refreshToken은 httpOnly 쿠키로 전달
- Redis TTL로 refreshToken 자동 만료
- 모든 예외는 CustomError로 처리

---

## 📦 의존 기술 스택

- **Node.js** / **Express**
- **TypeScript**
- **TypeORM** / PostgreSQL
- **Redis (ioredis)**
- **JWT** for auth
- **Winston** for logging

---

## 🧪 테스트 및 디버깅
- 모든 예외는 `handleControllerError`로 처리
- 응답은 `resHandler`로 통일된 포맷 반환
- 요청/에러/Redis 처리 결과는 Winston logger로 기록됨

---

## 🛠️ 개발 중 유의사항

- `.env` 파일에서 환경 변수 관리 (`REDIS_HOST`, `PORT`, 등)
- 로직 변경 시 response/log 포맷 통일 유지하기
- DTO 및 타입 정의를 통해 안전한 요청 처리 유지

---

## 📄 향후 추가 예정 기능

- 이메일 찾기 / 비밀번호 재설정
- 이메일 인증 기반 회원가입 절차
- 관리자 권한 분리 및 Role 기반 접근 제어

---

## 📬 Contact

문제나 제안사항이 있다면 언제든지 PR 또는 Issue를 등록해주세요.

---

> 이 서비스는 MSA 아키텍처 기반에서 인증 모듈로 사용됩니다.

