import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { mcpClient } from './mcp-client.js';
import { analyzeFile } from './gpt-service.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// MCP 서버 연결 초기화
let mcpInitialized = false;

async function ensureMCPConnection() {
  if (!mcpInitialized) {
    await mcpClient.connect();
    mcpInitialized = true;
  }
}

// 디렉터리 목록 조회
app.get('/api/directory', async (req, res) => {
  try {
    await ensureMCPConnection();
    // 쿼리 파라미터로 전달된 경로 사용, 없으면 환경변수 기본값 사용
    const path = req.query.path || process.env.MCP_ALLOWED_DIRECTORY || '/Users/junsangdong/Desktop';
    
    const result = await mcpClient.listDirectory(path);
    
    // 응답 형식 정규화
    let entries = [];
    if (result.entries) {
      entries = result.entries;
    } else if (Array.isArray(result)) {
      entries = result;
    } else if (result.content && Array.isArray(result.content)) {
      entries = result.content;
    }
    
    res.json({ entries });
  } catch (error) {
    console.error('디렉터리 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 파일 읽기
app.get('/api/file', async (req, res) => {
  try {
    await ensureMCPConnection();
    const path = req.query.path;
    
    if (!path) {
      return res.status(400).json({ error: '파일 경로가 필요합니다.' });
    }
    
    const result = await mcpClient.readFile(path);
    
    // 응답 형식 정규화
    const content = result.content || result.text || JSON.stringify(result, null, 2);
    res.json({ content, path });
  } catch (error) {
    console.error('파일 읽기 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// OpenAI API 키 검증
app.post('/api/validate-api-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ valid: false, message: 'API 키가 제공되지 않았습니다.' });
    }
    
    // 간단한 형식 검증 (sk-로 시작하는지 확인)
    if (!apiKey.startsWith('sk-')) {
      return res.json({ valid: false, message: '유효하지 않은 API 키 형식입니다.' });
    }
    
    // 실제 OpenAI API 호출로 검증
    try {
      const OpenAI = (await import('openai')).default;
      const testClient = new OpenAI({ apiKey });
      
      // 간단한 모델 목록 조회로 검증
      await testClient.models.list();
      
      return res.json({ valid: true, message: '유효한 키입니다.' });
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        return res.json({ valid: false, message: '유효하지 않은 API 키입니다.' });
      }
      // 네트워크 오류 등은 유효한 것으로 간주 (형식만 확인)
      return res.json({ valid: true, message: '유효한 키입니다.' });
    }
  } catch (error) {
    console.error('API 키 검증 오류:', error);
    return res.status(500).json({ valid: false, message: '검증 중 오류가 발생했습니다.' });
  }
});

// 파일 분석 (요약, 키워드, 제목)
app.post('/api/analyze', async (req, res) => {
  try {
    const { type, content, apiKey } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: '분석할 내용이 필요합니다.' });
    }
    
    if (!apiKey) {
      return res.status(400).json({ error: 'OpenAI API 키가 필요합니다.' });
    }
    
    const result = await analyzeFile(type, content, apiKey);
    res.json(result);
  } catch (error) {
    console.error('파일 분석 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 한 번에 분석하기
app.post('/api/analyze-all', async (req, res) => {
  try {
    const { content, apiKey } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: '분석할 내용이 필요합니다.' });
    }
    
    if (!apiKey) {
      return res.status(400).json({ error: 'OpenAI API 키가 필요합니다.' });
    }
    
    const [summary, keywords, title] = await Promise.all([
      analyzeFile('summary', content, apiKey),
      analyzeFile('keywords', content, apiKey),
      analyzeFile('title', content, apiKey)
    ]);
    
    res.json({
      summary: summary.result,
      keywords: keywords.result,
      title: title.result
    });
  } catch (error) {
    console.error('전체 분석 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});

// 프로세스 종료 시 MCP 연결 정리
process.on('SIGINT', async () => {
  if (mcpInitialized) {
    await mcpClient.disconnect();
  }
  process.exit(0);
});

