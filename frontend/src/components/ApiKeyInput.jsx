import { useState, useEffect } from 'react';
import './ApiKeyInput.css';

function ApiKeyInput({ apiKey, onApiKeyChange }) {
  const [inputValue, setInputValue] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // localStorage에서 저장된 키 불러오기
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setInputValue(savedKey);
      setIsValid(true);
      setValidationMessage('유효한 키입니다.');
    }
  }, []);

  const handleValidate = async () => {
    if (!inputValue.trim()) {
      setValidationMessage('API 키를 입력해주세요.');
      setIsValid(false);
      return;
    }

    setIsValidating(true);
    setValidationMessage('검증 중...');

    try {
      const response = await fetch('/api/validate-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: inputValue.trim() }),
      });

      const data = await response.json();

      if (data.valid) {
        // 유효한 키인 경우 localStorage에 저장
        localStorage.setItem('openai_api_key', inputValue.trim());
        onApiKeyChange(inputValue.trim());
        setIsValid(true);
        setValidationMessage(data.message || '유효한 키입니다.');
      } else {
        setIsValid(false);
        setValidationMessage(data.message || '유효하지 않은 키입니다.');
        localStorage.removeItem('openai_api_key');
        onApiKeyChange('');
      }
    } catch (error) {
      console.error('API 키 검증 오류:', error);
      setIsValid(false);
      setValidationMessage('검증 중 오류가 발생했습니다.');
      localStorage.removeItem('openai_api_key');
      onApiKeyChange('');
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleValidate();
    }
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
    // 입력 중에는 검증 메시지 초기화
    if (validationMessage && !isValidating) {
      setValidationMessage('');
      setIsValid(false);
    }
  };

  return (
    <div className="api-key-input-container">
      <div className="api-key-input-wrapper">
        <input
          type="password"
          className="api-key-input"
          placeholder="OpenAI API 키 입력"
          value={inputValue}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          disabled={isValidating}
        />
        <button
          className="api-key-validate-btn"
          onClick={handleValidate}
          disabled={isValidating || !inputValue.trim()}
        >
          {isValidating ? '검증 중...' : '확인'}
        </button>
      </div>
      {validationMessage && (
        <div className={`validation-message ${isValid ? 'valid' : 'invalid'}`}>
          {validationMessage}
        </div>
      )}
      <div className="api-key-hint">
        API 키 값은 사용자의 브라우저에만 저장됩니다.
      </div>
    </div>
  );
}

export default ApiKeyInput;

