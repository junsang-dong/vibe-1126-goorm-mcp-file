import { useState } from 'react';
import './AnalysisPanel.css';

function AnalysisPanel({ analysisData, onAnalyze, onAnalyzeAll, loading, hasContent }) {
  const { summary, keywords, title } = analysisData;
  const [copyMessage, setCopyMessage] = useState('');

  const handleCopyResults = async () => {
    // 분석 결과가 하나라도 있는지 확인
    if (!title && !summary && !keywords) {
      setCopyMessage('복사할 분석 결과가 없습니다.');
      setTimeout(() => setCopyMessage(''), 2000);
      return;
    }

    // 분석 결과를 텍스트로 포맷팅
    let textToCopy = '';
    
    if (title) {
      textToCopy += `📌 추천 제목\n${title}\n\n`;
    }
    
    if (summary) {
      textToCopy += `📝 요약\n${summary}\n\n`;
    }
    
    if (keywords) {
      textToCopy += `🔑 키워드\n${keywords}\n`;
    }

    try {
      await navigator.clipboard.writeText(textToCopy.trim());
      setCopyMessage('✅ 복사되었습니다!');
      setTimeout(() => setCopyMessage(''), 2000);
    } catch (error) {
      console.error('복사 실패:', error);
      setCopyMessage('❌ 복사 실패');
      setTimeout(() => setCopyMessage(''), 2000);
    }
  };

  const hasResults = title || summary || keywords;

  return (
    <div className="analysis-panel">
      <div className="analysis-header">
        <h2>AI 분석</h2>
      </div>
      
      <div className="analysis-controls">
        <button
          className="analyze-btn analyze-all"
          onClick={onAnalyzeAll}
          disabled={!hasContent || loading}
        >
          ✨ 한 번에 분석하기
        </button>
        
        <div className="analyze-buttons">
          <button
            className="analyze-btn"
            onClick={() => onAnalyze('summary')}
            disabled={!hasContent || loading}
          >
            📝 요약하기
          </button>
          <button
            className="analyze-btn"
            onClick={() => onAnalyze('keywords')}
            disabled={!hasContent || loading}
          >
            🔑 키워드 추출
          </button>
          <button
            className="analyze-btn"
            onClick={() => onAnalyze('title')}
            disabled={!hasContent || loading}
          >
            📌 제목 추천
          </button>
        </div>
      </div>

      <div className="analysis-results">
        <AnalysisCard
          title="📌 추천 제목"
          content={title}
          loading={loading}
        />
        
        <AnalysisCard
          title="📝 요약"
          content={summary}
          loading={loading}
        />
        
        <AnalysisCard
          title="🔑 키워드"
          content={keywords}
          loading={loading}
          isKeywords={true}
        />
      </div>

      <div className="analysis-footer">
        <button
          className="copy-results-btn"
          onClick={handleCopyResults}
          disabled={!hasResults || loading}
        >
          📋 AI 분석 결과 복사
        </button>
        {copyMessage && (
          <div className={`copy-message ${copyMessage.includes('✅') ? 'success' : 'error'}`}>
            {copyMessage}
          </div>
        )}
      </div>
    </div>
  );
}

function AnalysisCard({ title, content, loading, isKeywords = false }) {
  return (
    <div className="analysis-card">
      <h3 className="card-title">{title}</h3>
      <div className="card-content">
        {loading && !content ? (
          <div className="loading">분석 중...</div>
        ) : content ? (
          isKeywords ? (
            <div className="keywords-list">
              {content.split(',').map((keyword, idx) => (
                <span key={idx} className="keyword-tag">
                  {keyword.trim()}
                </span>
              ))}
            </div>
          ) : (
            <p>{content}</p>
          )
        ) : (
          <div className="empty-state">분석 결과가 없습니다.</div>
        )}
      </div>
    </div>
  );
}

export default AnalysisPanel;

