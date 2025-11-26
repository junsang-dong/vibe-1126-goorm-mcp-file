import { useState, useEffect } from 'react';
import FileTree from './components/FileTree';
import FileViewer from './components/FileViewer';
import AnalysisPanel from './components/AnalysisPanel';
import ApiKeyInput from './components/ApiKeyInput';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [analysisData, setAnalysisData] = useState({
    summary: null,
    keywords: null,
    title: null
  });
  const [loading, setLoading] = useState(false);
  const [baseDirectory, setBaseDirectory] = useState('/Users/junsangdong/Desktop');
  const [apiKey, setApiKey] = useState('');

  // localStorage에서 API 키 불러오기
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleFileSelect = async (filePath) => {
    setSelectedFile(filePath);
    setFileContent('');
    setAnalysisData({ summary: null, keywords: null, title: null });
    
    try {
      setLoading(true);
      const response = await fetch(`/api/file?path=${encodeURIComponent(filePath)}`);
      const data = await response.json();
      
      if (data.content) {
        setFileContent(data.content);
      } else if (data.text) {
        setFileContent(data.text);
      } else {
        setFileContent(JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.error('파일 읽기 오류:', error);
      setFileContent('파일을 읽는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (type) => {
    if (!fileContent) return;
    if (!apiKey) {
      alert('OpenAI API 키를 먼저 입력해주세요.');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, content: fileContent, apiKey }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '분석 요청 실패');
      }
      
      const data = await response.json();
      
      setAnalysisData(prev => ({
        ...prev,
        [type]: data.result
      }));
    } catch (error) {
      console.error('분석 오류:', error);
      alert(`분석 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeAll = async () => {
    if (!fileContent) return;
    if (!apiKey) {
      alert('OpenAI API 키를 먼저 입력해주세요.');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/analyze-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: fileContent, apiKey }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '분석 요청 실패');
      }
      
      const data = await response.json();
      
      setAnalysisData({
        summary: data.summary,
        keywords: data.keywords,
        title: data.title
      });
    } catch (error) {
      console.error('전체 분석 오류:', error);
      alert(`분석 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>📁 MCP 파일 비서</h1>
          <p>로컬 파일을 읽고 AI로 분석하는 도우미</p>
        </div>
        <div className="header-right">
          <ApiKeyInput 
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
          />
        </div>
      </header>
      
      <div className="app-body">
        <aside className="sidebar">
          <FileTree 
            onFileSelect={handleFileSelect}
            baseDirectory={baseDirectory}
            onBaseDirectoryChange={setBaseDirectory}
          />
        </aside>
        
        <main className="main-content">
          <FileViewer 
            content={fileContent} 
            loading={loading}
            selectedFile={selectedFile}
          />
        </main>
        
        <aside className="analysis-panel">
          <AnalysisPanel
            analysisData={analysisData}
            onAnalyze={handleAnalyze}
            onAnalyzeAll={handleAnalyzeAll}
            loading={loading}
            hasContent={!!fileContent}
          />
        </aside>
      </div>
    </div>
  );
}

export default App;

