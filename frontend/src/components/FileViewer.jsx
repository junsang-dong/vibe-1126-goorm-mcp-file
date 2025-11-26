import './FileViewer.css';

function FileViewer({ content, loading, selectedFile }) {
  return (
    <div className="file-viewer">
      <div className="file-viewer-header">
        <h3>{selectedFile ? selectedFile.split('/').pop() : '파일을 선택하세요'}</h3>
        {selectedFile && (
          <span className="file-path">{selectedFile}</span>
        )}
      </div>
      <div className="file-viewer-content">
        {loading ? (
          <div className="loading">파일을 읽는 중...</div>
        ) : content ? (
          <pre className="file-content">{content}</pre>
        ) : (
          <div className="empty-state">
            <p>좌측에서 파일을 선택하면 내용이 여기에 표시됩니다.</p>
            <p className="hint">📄 TXT, MD 파일을 지원합니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileViewer;

