import { useState, useEffect } from 'react';
import './FileTree.css';

function FileTree({ onFileSelect, baseDirectory, onBaseDirectoryChange }) {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDirs, setExpandedDirs] = useState(new Set());
  const [basePath, setBasePath] = useState('');
  const [showDirInput, setShowDirInput] = useState(false);
  const [dirInputValue, setDirInputValue] = useState('');

  useEffect(() => {
    if (baseDirectory) {
      loadDirectory(baseDirectory);
    }
  }, [baseDirectory]);

  const loadDirectory = async (path) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/directory?path=${encodeURIComponent(path)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 응답 형식 정규화
      let items = [];
      if (data.entries && Array.isArray(data.entries)) {
        items = data.entries;
      } else if (Array.isArray(data)) {
        items = data;
      } else if (data.content && Array.isArray(data.content)) {
        items = data.content;
      }

      // 디렉터리 구조로 변환
      const treeData = buildTree(items, path);
      setTree(treeData);
      setBasePath(path);
    } catch (error) {
      console.error('디렉터리 로드 오류:', error);
      setTree([]);
      alert(`디렉터리 로드 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (items, basePath) => {
    const tree = [];
    const dirs = [];
    const files = [];

    items.forEach(item => {
      // item이 문자열인 경우 처리
      const name = typeof item === 'string' ? item : (item.name || item.path || '');
      if (!name) return;

      const isDir = item.type === 'directory' || 
                   item.type === 'dir' || 
                   (item.type === undefined && typeof item === 'object' && !item.type);
      
      const fullPath = basePath === '/' || basePath === '' 
        ? `/${name}` 
        : `${basePath.replace(/\/$/, '')}/${name}`;

      const treeItem = {
        name,
        type: isDir ? 'directory' : 'file',
        path: fullPath,
        children: isDir ? [] : undefined
      };

      if (isDir) {
        dirs.push(treeItem);
      } else {
        // 파일인 경우 (txt, md 위주, 또는 모든 파일)
        const ext = name.split('.').pop()?.toLowerCase();
        if (!ext || ext === 'txt' || ext === 'md' || ext === 'markdown') {
          files.push(treeItem);
        }
      }
    });

    // 디렉터리를 먼저, 그 다음 파일
    return [...dirs, ...files];
  };

  const toggleDirectory = async (dir) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(dir.path)) {
      newExpanded.delete(dir.path);
    } else {
      newExpanded.add(dir.path);
      // 디렉터리 확장 시 하위 항목 로드
      if (!dir.children || dir.children.length === 0) {
        try {
          const response = await fetch(`/api/directory?path=${encodeURIComponent(dir.path)}`);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          
          const data = await response.json();
          const items = data.entries || data.content || data || [];
          const children = buildTree(items, dir.path);
          
          // 트리 상태 업데이트
          setTree(prevTree => {
            const updateTree = (nodes) => {
              return nodes.map(node => {
                if (node.path === dir.path) {
                  return { ...node, children };
                }
                if (node.children) {
                  return { ...node, children: updateTree(node.children) };
                }
                return node;
              });
            };
            return updateTree(prevTree);
          });
        } catch (error) {
          console.error('하위 디렉터리 로드 오류:', error);
          alert(`디렉터리 로드 실패: ${error.message}`);
        }
      }
    }
    setExpandedDirs(newExpanded);
  };

  const handleItemClick = async (item) => {
    if (item.type === 'directory') {
      toggleDirectory(item);
    } else {
      onFileSelect(item.path);
    }
  };

  const renderTreeItem = (item, level = 0) => {
    const isExpanded = expandedDirs.has(item.path);
    const isDir = item.type === 'directory';

    return (
      <div key={item.path} className="tree-item">
        <div
          className={`tree-item-content ${isDir ? 'directory' : 'file'}`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => handleItemClick(item)}
        >
          {isDir && (
            <span className="tree-icon">
              {isExpanded ? '📂' : '📁'}
            </span>
          )}
          {!isDir && <span className="tree-icon">📄</span>}
          <span className="tree-name">{item.name}</span>
        </div>
        {isDir && isExpanded && item.children && (
          <div className="tree-children">
            {item.children.map(child => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading && tree.length === 0) {
    return (
      <div className="file-tree">
        <div className="file-tree-header">
          <h2>파일 목록</h2>
        </div>
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  const handleChangeDirectory = () => {
    if (dirInputValue.trim()) {
      onBaseDirectoryChange(dirInputValue.trim());
      setBasePath(dirInputValue.trim());
      setExpandedDirs(new Set());
      setShowDirInput(false);
      setDirInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleChangeDirectory();
    } else if (e.key === 'Escape') {
      setShowDirInput(false);
      setDirInputValue('');
    }
  };

  return (
    <div className="file-tree">
      <div className="file-tree-header">
        <h2>파일 목록</h2>
        <div className="header-actions">
          <button 
            className="refresh-btn"
            onClick={() => loadDirectory(basePath || baseDirectory)}
            title="새로고침"
          >
            🔄
          </button>
          <button 
            className="dir-btn"
            onClick={() => setShowDirInput(!showDirInput)}
            title="디렉터리 변경"
          >
            📂
          </button>
        </div>
      </div>
      
      {showDirInput && (
        <div className="dir-input-container">
          <input
            type="text"
            className="dir-input"
            placeholder="디렉터리 경로 입력 (예: /Users/username/Desktop)"
            value={dirInputValue}
            onChange={(e) => setDirInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            autoFocus
          />
          <div className="dir-input-actions">
            <button 
              className="dir-confirm-btn"
              onClick={handleChangeDirectory}
            >
              확인
            </button>
            <button 
              className="dir-cancel-btn"
              onClick={() => {
                setShowDirInput(false);
                setDirInputValue('');
              }}
            >
              취소
            </button>
          </div>
          <div className="current-dir">
            현재: {baseDirectory}
          </div>
        </div>
      )}
      
      <div className="tree-container">
        {tree.length === 0 ? (
          <div className="empty-state">파일이 없습니다.</div>
        ) : (
          tree.map(item => renderTreeItem(item))
        )}
      </div>
    </div>
  );
}

export default FileTree;

