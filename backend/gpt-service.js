import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export async function analyzeFile(type, content, apiKey = null) {
  try {
    // API 키는 파라미터로 받거나 환경변수에서 가져옴
    const key = apiKey || process.env.OPENAI_API_KEY;
    
    if (!key) {
      throw new Error('OpenAI API 키가 제공되지 않았습니다.');
    }
    
    const openai = new OpenAI({
      apiKey: key
    });

    let prompt = '';
    
    switch (type) {
      case 'summary':
        prompt = `다음 텍스트를 한국어로 간결하게 요약해주세요. 핵심 내용을 3-5문장으로 정리해주세요:\n\n${content}`;
        break;
      case 'keywords':
        prompt = `다음 텍스트에서 주요 키워드를 5-10개 추출해주세요. 쉼표로 구분하여 나열해주세요:\n\n${content}`;
        break;
      case 'title':
        prompt = `다음 텍스트에 적합한 제목을 1개 추천해주세요. 간결하고 명확하게 작성해주세요:\n\n${content}`;
        break;
      default:
        throw new Error('알 수 없는 분석 유형입니다.');
    }

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '당신은 텍스트 분석 전문가입니다. 사용자의 요청에 따라 정확하고 간결하게 응답합니다.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const result = completion.choices[0].message.content.trim();
    
    return {
      type,
      result,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('GPT API 오류:', error);
    throw new Error(`분석 실패: ${error.message}`);
  }
}

