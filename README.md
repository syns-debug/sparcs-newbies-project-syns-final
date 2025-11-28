# SPARCS Community

SPARCS 신입생 커뮤니티 웹사이트

## 기술 스택

- **Front-End**: Next.js 14, TypeScript, Tailwind CSS
- **Back-End**: Express.js, TypeScript
- **Database**: MySQL 8.0

## 설치 및 실행

### 1. 의존성 설치

```bash
# Back-End
cd Back-End
npm install

# Front-End
cd ../Front-End
npm install
```

### 2. 데이터베이스 설정

```bash
# Docker MySQL 실행
docker-compose up -d

# 테이블 생성 (자동 실행됨)
```

### 3. 환경 변수 설정

**Back-End/.env**
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sparcsnewbies
DB_NAME=db
DB_PORT=3307
PORT=3001
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

**Front-End/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. 실행

```bash
# Back-End (터미널 1)
cd Back-End
npm run dev

# Front-End (터미널 2)
cd Front-End
npm run dev
```

- Front-End: http://localhost:3000
- Back-End: http://localhost:3001

## 주요 기능

- 회원가입/로그인
- 게시판 (신프 list, Dump list)
- 게시글 작성/수정/삭제
- 댓글
- 좋아요/북마크
- 깐부 (팔로우) 기능
- 나만의 기록 (비공개 글)
- 프로필 관리
- 비밀번호 변경
- 회원 탈퇴
