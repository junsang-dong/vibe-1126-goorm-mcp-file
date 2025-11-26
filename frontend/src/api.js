// API 유틸리티 함수들 (필요시 사용)
const API_BASE = '/api';

export const api = {
  getDirectory: async (path) => {
    const response = await fetch(`${API_BASE}/directory?path=${encodeURIComponent(path)}`);
    return response.json();
  },
  
  getFile: async (path) => {
    const response = await fetch(`${API_BASE}/file?path=${encodeURIComponent(path)}`);
    return response.json();
  },
  
  analyze: async (type, content) => {
    const response = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, content }),
    });
    return response.json();
  },
  
  analyzeAll: async (content) => {
    const response = await fetch(`${API_BASE}/analyze-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    return response.json();
  },
};

