import { GoogleGenAI, Chat } from "@google/genai";
import type { Topic, ChatMessage } from '../types';

// This is a placeholder. In a real environment, this should be a secure environment variable.
const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;

// 디버깅용 로그 (개발 환경에서만)
if (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV) {
    console.log("API_KEY check:", {
        'process.env.API_KEY': process.env.API_KEY ? 'set' : 'not set',
        'process.env.GEMINI_API_KEY': process.env.GEMINI_API_KEY ? 'set' : 'not set',
        'final API_KEY': API_KEY ? 'set' : 'not set'
    });
}

if (!API_KEY || API_KEY === 'your_api_key_here') {
    console.error("GEMINI_API_KEY is not set. Please set the GEMINI_API_KEY environment variable in .env file.");
    console.error("Get your API key from: https://aistudio.google.com/app/apikey");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || '' });

const chatInstances: Record<number, Chat> = {};

function getChatInstance(topic: Topic): Chat {
    if (!chatInstances[topic.id]) {
        chatInstances[topic.id] = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `당신은 철학자 '${topic.philosopher}'입니다. 학생이 '${topic.question}'이라는 주제에 대해 질문하고 있습니다. 당신의 철학에 기반하여, 다음 초기 답변을 바탕으로 학생의 질문에 친절하고 이해하기 쉽게 답변해주세요.

**중요 규칙:**
1. **간결성:** 모든 답변은 **반드시 2~3 문장 이내**로 매우 간결하게 작성해주세요. 길게 설명하지 마세요.
2. **부적절한 입력 대응:** 학생이 욕설, 공격적인 언어, 주제와 무관한 무의미한 말을 할 경우, 직접적으로 반응하지 마세요. 대신, 철학자로서의 품위를 지키며 "흥미로운 관점이네요. 다시 우리의 주제인 '${topic.question}'에 대해 이야기해볼까요?"와 같이 부드럽게 대화를 원래 주제로 유도해주세요. 같은 답변을 반복하지 말고 조금씩 다른 답변을 하세요. 학생을 꾸짖거나 비판하지 마세요.
3. **마크다운 형식:** 답변은 항상 마크다운 형식으로 작성해주세요.

초기 답변:
${topic.initialAnswer}`,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
    }
    return chatInstances[topic.id];
}


export async function* getChatResponseStream(
  topic: Topic,
  history: ChatMessage[]
): AsyncGenerator<string, void, unknown> {
  const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;
  
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    yield "**API 키가 설정되지 않았습니다.**\n\n`.env` 파일에 `GEMINI_API_KEY`를 설정해주세요.\n\nAPI 키는 다음 링크에서 발급받을 수 있습니다:\nhttps://aistudio.google.com/app/apikey";
    return;
  }

  const chat = getChatInstance(topic);

  // The last message is the new user prompt
  const lastMessage = history[history.length - 1];
  
  if (lastMessage.role !== 'user') {
    throw new Error("Last message must be from the user");
  }

  try {
    const resultStream = await chat.sendMessageStream({ message: lastMessage.content });
    
    for await (const chunk of resultStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error: any) {
    console.error("Gemini API call failed:", error);
    console.error("Error details:", {
      message: error?.message,
      status: error?.status,
      statusText: error?.statusText,
      response: error?.response
    });
    
    let errorMessage = "죄송합니다, 답변을 가져오는 중 문제가 발생했습니다.";
    
    if (error?.status === 400) {
      errorMessage += "\n\n400 에러: 요청 형식이 잘못되었습니다. API 키와 모델 설정을 확인해주세요.";
    } else if (error?.status === 401) {
      errorMessage += "\n\n401 에러: API 키가 유효하지 않습니다. API 키를 확인해주세요.";
    } else if (error?.status === 403) {
      errorMessage += "\n\n403 에러: API 키에 권한이 없습니다. Google Cloud Console에서 API를 활성화해주세요.";
    }
    
    yield errorMessage;
  }
}

export async function generateSuggestedQuestions(
  topic: Topic,
  history: ChatMessage[]
): Promise<string[]> {
  const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;
  
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    return [];
  }

  try {
    // 마지막 학생 질문과 철학자 답변 추출
    const lastUserMessage = history.filter(msg => msg.role === 'user').slice(-1)[0];
    const lastModelMessage = history.filter(msg => msg.role === 'model').slice(-1)[0];
    
    if (!lastUserMessage || !lastModelMessage) {
      return [];
    }

    const prompt = `당신은 철학 교사입니다. 학생이 ${topic.philosopher}와 다음 대화를 나누었습니다:

학생 질문: ${lastUserMessage.content}

${topic.philosopher} 답변: ${lastModelMessage.content}

위 대화 내용을 바탕으로, 중학생 수준에서 이해할 수 있고 자연스러운 한국어로 추천 질문 2개를 생성해주세요. 각 질문은:
1. 마지막 대화 내용과 관련이 있어야 합니다
2. 존댓말로 끝나야 합니다 (예: "~할까요?", "~인가요?")
3. 한 문장으로 간결해야 합니다
4. 철학적으로 더 깊이 탐구할 수 있는 질문이어야 합니다
5. **중요**: 철학자 이름이나 "~의 말씀처럼", "~가 말한 것처럼" 같은 문구를 사용하지 마세요. 직접적이고 간결한 질문만 작성하세요.

JSON 형식으로 응답해주세요:
{
  "questions": ["질문1", "질문2"]
}`;

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: 'You are a helpful assistant that generates suggested questions in Korean. Always respond with valid JSON only.',
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    // sendMessageStream 사용하여 응답 받기
    const resultStream = await chat.sendMessageStream({ message: prompt });
    let fullResponse = '';
    
    for await (const chunk of resultStream) {
      if (chunk.text) {
        fullResponse += chunk.text;
      }
    }

    // JSON 파싱
    try {
      // JSON 코드 블록이 있으면 추출
      const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length >= 2) {
          return parsed.questions.slice(0, 2);
        }
      }
    } catch (parseError) {
      console.error('Failed to parse suggested questions:', parseError);
    }

    // JSON 파싱 실패 시 텍스트에서 질문 추출
    const lines = fullResponse.split('\n').filter(line => line.trim().length > 0);
    const questions: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      // 질문 패턴 찾기 (번호, 마침표, 따옴표 등으로 시작하는 경우)
      if (trimmed.match(/^[0-9]\.|^[-•]|^["']/)) {
        const question = trimmed.replace(/^[0-9]\.\s*|^[-•]\s*|^["']|["']$/g, '').trim();
        if (question.length > 10 && (question.endsWith('까요?') || question.endsWith('인가요?') || question.endsWith('나요?'))) {
          questions.push(question);
        }
      }
    }

    return questions.slice(0, 2);
  } catch (error: any) {
    console.error('Failed to generate suggested questions:', error);
    return [];
  }
}