import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

class MCPClient {
  constructor() {
    this.client = null;
    this.transport = null;
  }

  async connect() {
    try {
      // MCP 서버 연결 설정
      // 환경변수에서 MCP 서버 명령어와 인자 가져오기
      const command = process.env.MCP_COMMAND || 'npx';
      const allowedDir = process.env.MCP_ALLOWED_DIRECTORY || '/Users/junsangdong/Desktop';
      
      // MCP_ARGS가 있으면 사용, 없으면 기본값 사용
      let args = process.env.MCP_ARGS 
        ? process.env.MCP_ARGS.split(' ').filter(arg => arg.trim()) 
        : ['-y', '@modelcontextprotocol/server-filesystem'];
      
      // 디렉터리를 명령줄 인자로 추가
      // MCP filesystem 서버는 명령줄 인자로 허용된 디렉터리를 받습니다
      if (!args.includes(allowedDir)) {
        args.push(allowedDir);
      }
      
      console.log('MCP 서버 시작:', command, args.join(' '));
      
      this.transport = new StdioClientTransport({
        command,
        args
      });

      this.client = new Client({
        name: 'mcp-file-assistant',
        version: '1.0.0',
      }, {
        capabilities: {}
      });

      await this.client.connect(this.transport);
      console.log('MCP 서버에 연결되었습니다.');
      console.log('허용된 디렉터리:', allowedDir);
      
      // 연결 후 사용 가능한 도구 확인 (디버깅용)
      try {
        const toolsResponse = await this.client.listTools();
        console.log('사용 가능한 MCP 도구:', toolsResponse.tools?.map(t => t.name) || []);
      } catch (toolError) {
        console.warn('도구 목록 조회 실패 (무시 가능):', toolError.message);
      }
    } catch (error) {
      console.error('MCP 연결 오류:', error);
      throw error;
    }
  }

  async listDirectory(path) {
    try {
      if (!this.client) {
        throw new Error('MCP 클라이언트가 연결되지 않았습니다.');
      }

      // MCP tools/list_tools를 통해 사용 가능한 도구 확인
      const toolsResponse = await this.client.listTools();
      const tools = toolsResponse.tools || [];
      
      // list_directory 도구 찾기 (여러 가능한 이름 시도)
      const listDirTool = tools.find(tool => 
        tool.name === 'mcp_filesystem_list_directory' ||
        tool.name === 'mcp_filesystem_list_directory_with_sizes' ||
        tool.name === 'list_directory'
      );

      if (!listDirTool) {
        // 사용 가능한 도구 목록 출력 (디버깅용)
        const availableTools = tools.map(t => t.name);
        console.error('사용 가능한 도구:', availableTools);
        throw new Error(`list_directory 도구를 찾을 수 없습니다. 사용 가능한 도구: ${availableTools.join(', ')}`);
      }

      console.log(`디렉터리 조회 시도: ${path} (도구: ${listDirTool.name})`);
      
      const result = await this.client.callTool({
        name: listDirTool.name,
        arguments: { path }
      });

      // MCP 응답 형식에 따라 파싱
      let entries = [];
      
      // 1. content 배열이 있는 경우
      if (result.content && Array.isArray(result.content)) {
        // 텍스트 형식 응답 처리 ([FILE] name, [DIR] name 형식)
        for (const item of result.content) {
          if (item.type === 'text' && item.text) {
            // 텍스트를 파싱하여 항목 추출
            const lines = item.text.split('\n').filter(line => line.trim());
            for (const line of lines) {
              const match = line.match(/^\[(FILE|DIR)\]\s+(.+)$/);
              if (match) {
                entries.push({
                  name: match[2],
                  type: match[1] === 'DIR' ? 'directory' : 'file'
                });
              }
            }
          } else if (typeof item === 'string') {
            entries.push({ name: item, type: 'file' });
          } else if (item.name) {
            entries.push(item);
          }
        }
      }
      
      // 2. entries가 직접 있는 경우
      else if (result.entries && Array.isArray(result.entries)) {
        entries = result.entries;
      }
      
      // 3. 다른 형식 처리
      else if (Array.isArray(result)) {
        entries = result;
      }

      if (entries.length > 0) {
        return { entries };
      }

      // 파싱 실패 시 원본 반환
      console.warn('예상치 못한 응답 형식:', JSON.stringify(result, null, 2).substring(0, 500));
      return result;
    } catch (error) {
      console.error('디렉터리 목록 조회 오류:', error);
      console.error('오류 상세:', error.stack);
      throw error;
    }
  }

  async readFile(path) {
    try {
      if (!this.client) {
        throw new Error('MCP 클라이언트가 연결되지 않았습니다.');
      }

      const toolsResponse = await this.client.listTools();
      const tools = toolsResponse.tools || [];
      
      // 파일 읽기 도구 찾기 (우선순위 순)
      const readFileTool = tools.find(tool => 
        tool.name === 'mcp_filesystem_read_text_file' ||
        tool.name === 'mcp_filesystem_read_file' ||
        tool.name === 'read_file'
      );

      if (!readFileTool) {
        console.log('사용 가능한 도구:', tools.map(t => t.name));
        throw new Error('파일 읽기 도구를 찾을 수 없습니다.');
      }

      const result = await this.client.callTool({
        name: readFileTool.name,
        arguments: { path }
      });

      // MCP 응답 형식에 따라 파싱
      if (result.content && Array.isArray(result.content)) {
        const textContent = result.content
          .filter(item => item.type === 'text')
          .map(item => item.text)
          .join('');
        
        if (textContent) {
          return { content: textContent, text: textContent };
        }
      }

      // 직접 text 필드가 있는 경우
      if (result.text) {
        return { content: result.text, text: result.text };
      }

      return result;
    } catch (error) {
      console.error('파일 읽기 오류:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.client) {
        await this.client.close();
        this.client = null;
      }
      if (this.transport) {
        this.transport = null;
      }
      console.log('MCP 연결이 종료되었습니다.');
    } catch (error) {
      console.error('MCP 연결 종료 오류:', error);
    }
  }
}

export const mcpClient = new MCPClient();

