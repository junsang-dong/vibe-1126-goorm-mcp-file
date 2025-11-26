# 📁 MCP 파일 비서

MCP File Server를 활용한 로컬 파일 요약 및 분석 웹 애플리케이션입니다.

## ✨ 주요 기능

- **파일 탐색**: MCP File Server를 통해 로컬 디렉터리의 파일 목록을 트리 형태로 조회
- **파일 읽기**: TXT, MD 파일을 선택하여 내용 확인
- **AI 분석**: GPT API를 활용한 파일 분석
  - 📝 요약하기: 파일 내용을 간결하게 요약
  - 🔑 키워드 추출: 주요 키워드 5-10개 추출
  - 📌 제목 추천: 파일에 적합한 제목 추천
  - ✨ 한 번에 분석하기: 모든 분석을 한 번에 수행

## 🏗️ 프로젝트 구조

```
mcp-file-assistant/
├── frontend/          # React + Vite 프론트엔드
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileTree.jsx      # 파일 트리 컴포넌트
│   │   │   ├── FileViewer.jsx    # 파일 뷰어 컴포넌트
│   │   │   └── AnalysisPanel.jsx # 분석 패널 컴포넌트
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── backend/           # Express + MCP 클라이언트 백엔드
│   ├── server.js       # Express 서버
│   ├── mcp-client.js   # MCP 클라이언트
│   ├── gpt-service.js  # GPT API 서비스
│   └── package.json
├── .env.example       # 환경변수 예제
└── README.md
```

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone <repository-url>
cd vibe-1126-goorm-mcp-file
```

### 2. 의존성 설치

```bash
npm run install:all
```

또는 개별적으로 설치:

```bash
# 루트 의존성
npm install

# 백엔드 의존성
cd backend
npm install

# 프론트엔드 의존성
cd ../frontend
npm install
```

### 3. 환경변수 설정

`backend/.env` 파일을 생성하고 다음 내용을 입력하세요:

```bash
cp .env.example backend/.env
```

`backend/.env` 파일을 열어 다음 값들을 설정하세요:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
MCP_COMMAND=npx
MCP_ARGS=-y @modelcontextprotocol/server-filesystem
MCP_ALLOWED_DIRECTORY=/
PORT=3001
```

### 4. 개발 서버 실행

#### 방법 1: 동시 실행 (권장)

```bash
npm run dev
```

이 명령어는 백엔드와 프론트엔드를 동시에 실행합니다.

#### 방법 2: 개별 실행

터미널 1 - 백엔드:
```bash
cd backend
npm run dev
```

터미널 2 - 프론트엔드:
```bash
cd frontend
npm run dev
```

### 5. 브라우저에서 접속

- 프론트엔드: http://localhost:5173
- 백엔드 API: http://localhost:3001

## 📖 사용 방법

1. **파일 선택**: 좌측 패널에서 디렉터리를 확장하고 파일을 클릭합니다.
2. **파일 확인**: 중앙 영역에서 선택한 파일의 내용을 확인합니다.
3. **분석 실행**: 우측 패널에서 원하는 분석 버튼을 클릭합니다.
   - 개별 분석: "요약하기", "키워드 추출", "제목 추천" 버튼
   - 전체 분석: "한 번에 분석하기" 버튼
4. **결과 확인**: 분석 결과가 우측 패널에 카드 형식으로 표시됩니다.

## 🔧 기술 스택

### 프론트엔드
- **React 18**: UI 라이브러리
- **Vite**: 빌드 도구 및 개발 서버
- **Axios**: HTTP 클라이언트

### 백엔드
- **Express**: Node.js 웹 프레임워크
- **@modelcontextprotocol/sdk**: MCP 클라이언트 SDK
- **OpenAI API**: GPT 모델을 통한 텍스트 분석

## 🌐 배포

### Vercel 배포 (프론트엔드)

1. Vercel에 프로젝트 연결
2. 빌드 설정:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. 환경변수 설정 (필요시)

### 백엔드 배포

백엔드는 Node.js 환경이 필요합니다. 다음 플랫폼을 고려하세요:
- Railway
- Render
- Heroku
- AWS EC2
- Google Cloud Run

배포 시 다음 환경변수를 설정하세요:
- `OPENAI_API_KEY`
- `MCP_COMMAND`
- `MCP_ARGS`
- `PORT`

## 🔒 보안 주의사항

- **API 키 보호**: `.env` 파일은 절대 Git에 커밋하지 마세요.
- **CORS 설정**: 프로덕션 환경에서는 CORS 설정을 적절히 구성하세요.
- **MCP 디렉터리 제한**: `MCP_ALLOWED_DIRECTORY`를 설정하여 접근 가능한 디렉터리를 제한하세요.

## 📝 라이선스

MIT

## 🤝 기여

이슈와 풀 리퀘스트를 환영합니다!

