# 🚀 배포 가이드

이 문서는 MCP 파일 비서 웹앱을 Vercel과 Railway에 배포하는 방법을 설명합니다.

## 📋 사전 준비

1. GitHub 리포지토리에 코드가 푸시되어 있어야 합니다
2. Vercel 계정 (무료)
3. Railway 계정 (무료 플랜 사용 가능)

## 🌐 Vercel 배포 (프론트엔드)

### 1단계: Vercel 프로젝트 생성

#### 방법 A: Vercel CLI 사용

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 프론트엔드 디렉토리로 이동
cd frontend

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

#### 방법 B: Vercel 웹 대시보드 사용

1. [vercel.com](https://vercel.com) 접속 및 로그인
2. "Add New Project" 클릭
3. GitHub 리포지토리 `junsang-dong/vibe-1126-goorm-mcp-file` 선택
4. 프로젝트 설정:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` (또는 `./frontend`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. "Deploy" 클릭

### 2단계: 환경변수 설정 (선택사항)

Vercel 대시보드에서:
- Settings → Environment Variables
- `VITE_API_URL`: 백엔드 API URL (예: `https://your-backend.railway.app`)

### 3단계: API 프록시 설정

`vercel.json` 파일이 이미 포함되어 있습니다. 백엔드 URL을 업데이트하세요:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-backend-url.railway.app/api/$1"
    }
  ]
}
```

또는 `frontend/src/api.js`에서 환경변수를 사용하도록 수정:

```javascript
const API_BASE = import.meta.env.VITE_API_URL || '/api';
```

## 🚂 Railway 배포 (백엔드)

### 1단계: Railway 프로젝트 생성

1. [railway.app](https://railway.app) 접속 및 로그인
2. "New Project" 클릭
3. "Deploy from GitHub repo" 선택
4. 리포지토리 `junsang-dong/vibe-1126-goorm-mcp-file` 선택

### 2단계: 서비스 설정

1. 생성된 서비스에서 "Settings" 클릭
2. **Root Directory**: `backend` 설정
3. **Start Command**: `npm start` 설정

### 3단계: 환경변수 설정

Railway 대시보드에서 "Variables" 탭:

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `MCP_COMMAND` | `npx` | MCP 서버 명령어 |
| `MCP_ARGS` | `-y @modelcontextprotocol/server-filesystem` | MCP 서버 인자 |
| `MCP_ALLOWED_DIRECTORY` | `/Users/junsangdong/Desktop` | 허용된 디렉터리 (서버 환경에 맞게 수정) |
| `PORT` | (자동 할당) | Railway가 자동으로 할당 |
| `OPENAI_API_KEY` | (선택사항) | 서버 측 기본 키 (클라이언트에서 제공하는 경우 불필요) |

**참고**: Railway는 Linux 환경이므로 디렉터리 경로를 적절히 수정해야 합니다. 예: `/home/railway/Desktop`

### 4단계: 배포 확인

1. Railway 대시보드에서 "Deployments" 탭 확인
2. 배포 완료 후 생성된 URL 확인 (예: `https://your-app.railway.app`)
3. 이 URL을 프론트엔드의 API URL로 설정

### 5단계: 도메인 설정 (선택사항)

Railway에서:
1. Settings → Networking
2. "Generate Domain" 클릭하여 커스텀 도메인 생성
3. 또는 "Custom Domain"에서 자신의 도메인 연결

## 🔗 프론트엔드와 백엔드 연결

### 방법 1: Vercel rewrites 사용

`vercel.json` 파일 수정:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-backend.railway.app/api/$1"
    }
  ]
}
```

### 방법 2: 환경변수 사용

1. Vercel 대시보드 → Settings → Environment Variables
2. `VITE_API_URL` 추가: `https://your-backend.railway.app`
3. `frontend/src/api.js` 수정:

```javascript
const API_BASE = import.meta.env.VITE_API_URL || '/api';
```

## ✅ 배포 확인

1. **프론트엔드**: Vercel에서 제공하는 URL 접속
2. **백엔드**: Railway에서 제공하는 URL로 API 테스트
   ```bash
   curl https://your-backend.railway.app/api/directory?path=/Users/junsangdong/Desktop
   ```

## 🔄 업데이트 배포

코드를 수정한 후:

```bash
# 변경사항 커밋
git add .
git commit -m "Update: 변경사항 설명"
git push origin main
```

Vercel과 Railway는 자동으로 재배포됩니다.

## 🐛 문제 해결

### CORS 오류
백엔드 `server.js`에서 CORS 설정 확인:
```javascript
app.use(cors({
  origin: ['https://your-frontend.vercel.app', 'http://localhost:5173']
}));
```

### MCP 서버 연결 실패
- Railway 환경에서 디렉터리 경로 확인
- `MCP_ALLOWED_DIRECTORY` 환경변수 확인
- Railway 로그 확인: Deployments → View Logs

### API 요청 실패
- 프론트엔드의 API URL 설정 확인
- 브라우저 개발자 도구 Network 탭에서 요청 확인
- 백엔드 로그 확인

## 📚 참고 자료

- [Vercel 문서](https://vercel.com/docs)
- [Railway 문서](https://docs.railway.app)
- [MCP 문서](https://modelcontextprotocol.io)

