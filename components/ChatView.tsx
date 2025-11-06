import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Topic, ChatMessage } from '../types';
import { getChatResponseStream, generateSuggestedQuestions } from '../services/geminiService';
import ChatBubble from './ChatBubble';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import PhilosopherProfileModal from './PhilosopherProfileModal';
import { PHILOSOPHER_PROFILES } from '../constants/philosopherProfiles';

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7l-4-4zM12 19c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
    </svg>
);


interface ChatViewProps {
  topic: Topic;
  onBack: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ topic, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [isTextbookVisible, setIsTextbookVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [studentInfo, setStudentInfo] = useState('');
  const [reflection, setReflection] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 철학자별 교과서 이미지 경로 매핑
  const getTextbookImagePath = (philosopher: string): string => {
    // 철학자 이름 매핑 (topics.ts의 이름과 실제 파일명 매칭)
    const nameMap: Record<string, string> = {
      '장자': '장자',
      '소크라테스': '소크라테스',
      '존 스튜어트 밀': '밀',
      '밀': '밀',
      '키케로': '키케로',
      '하이데거': '하이데거',
      '정약용': '정약용',
      '롤스': '롤스',
    };
    
    const fileName = nameMap[philosopher] || philosopher;
    return `/data/${fileName} 질문.png`;
  };

  useEffect(() => {
    // 초기 메시지: 학생이 첫 질문을 보내고, 철학자가 답변하는 형태
    const initialMessages = [
      {
        role: 'user' as const,
        content: topic.question,
      },
      {
        role: 'model' as const,
        content: topic.initialAnswer,
      },
    ];
    setMessages(initialMessages);
    setSuggestedQuestions([]);
    setIsVideoVisible(false); // Reset video visibility when topic changes
    setIsTextbookVisible(false); // Reset textbook visibility when topic changes

    // 초기 문답에 대한 추천 질문 생성
    setIsGeneratingSuggestions(true);
    generateSuggestedQuestions(topic, initialMessages)
      .then((suggestions) => {
        setSuggestedQuestions(suggestions);
      })
      .catch((error) => {
        console.error('Failed to generate initial suggestions:', error);
        setSuggestedQuestions([]);
      })
      .finally(() => {
        setIsGeneratingSuggestions(false);
      });
  }, [topic]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendQuestion = useCallback(async (question: string, isSuggested: boolean = false) => {
    if (isLoading) return;

    // 추천 질문 클릭 시 앞에 💡 추가
    const questionContent = isSuggested ? `💡 ${question}` : question;
    const userMessage: ChatMessage = { role: 'user', content: questionContent };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');
    setSuggestedQuestions([]); // 새로운 질문 전에 추천 질문 초기화
    setIsLoading(true);

    const fullHistory = [...messages, userMessage];
    
    try {
        const stream = await getChatResponseStream(topic, fullHistory);
        let newContent = '';
        setMessages((prev) => [...prev, { role: 'model', content: '' }]);

        for await (const chunk of stream) {
            newContent += chunk;
            setMessages((prev) => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage.role === 'model') {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { ...lastMessage, content: newContent };
                    return newMessages;
                }
                return prev;
            });
        }
        
        // 철학자가 답변 완료 후 추천 질문 생성
        const finalMessages = [...fullHistory, { role: 'model' as const, content: newContent }];
        setIsGeneratingSuggestions(true);
        try {
          const suggestions = await generateSuggestedQuestions(topic, finalMessages);
          setSuggestedQuestions(suggestions);
        } catch (error) {
          console.error('Failed to generate suggestions:', error);
          setSuggestedQuestions([]);
        } finally {
          setIsGeneratingSuggestions(false);
        }
    } catch (error) {
        console.error("Error getting response from Gemini:", error);
        setMessages(prev => [...prev, {role: 'model', content: '죄송합니다. 답변을 생성하는 중에 오류가 발생했습니다.'}]);
        setSuggestedQuestions([]);
    } finally {
        setIsLoading(false);
    }
    }, [isLoading, messages, topic]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;
    await sendQuestion(userInput);
  }, [userInput, isLoading, sendQuestion]);

  const handleSaveChat = useCallback(() => {
    if (!chatContainerRef.current || messages.length === 0 || isSaving) return;
    setShowSaveModal(true);
    setStudentInfo('');
    setReflection('');
  }, [messages.length, isSaving]);

  const handleSaveConfirm = useCallback(async () => {
    if (!studentInfo.trim()) {
      alert('학번과 이름을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    setShowSaveModal(false);

    try {
      // 학번/이름 정보를 표시할 임시 요소 생성
      const headerDiv = document.createElement('div');
      headerDiv.style.position = 'absolute';
      headerDiv.style.left = '-9999px';
      headerDiv.style.width = '210mm'; // A4 width
      headerDiv.style.padding = '10mm';
      headerDiv.style.backgroundColor = '#ffffff';
      headerDiv.style.fontFamily = 'Noto Sans KR, sans-serif';
      headerDiv.style.fontSize = '14px';
      headerDiv.style.color = '#000000';
      const reflectionHtml = reflection.trim() ? `<div style="margin-top: 12px; margin-bottom: 8px;"><strong>${topic.philosopher}와 대화를 나눈 소감:</strong></div><div style="margin-bottom: 8px; padding: 8px; background-color: #f5f5f5; border-radius: 4px; white-space: pre-wrap;">${reflection.trim()}</div>` : '';
      headerDiv.innerHTML = `
        <div style="margin-bottom: 8px;"><strong>학번:</strong> ${studentInfo.trim()}</div>
        <div style="margin-bottom: 8px;"><strong>철학자:</strong> ${topic.philosopher}</div>
        <div style="margin-bottom: 8px;"><strong>질문:</strong> ${topic.question}</div>
        ${reflectionHtml}
      `;
      document.body.appendChild(headerDiv);

      // 헤더 정보를 캔버스로 변환
      const headerCanvas = await html2canvas(headerDiv, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        width: headerDiv.offsetWidth,
        height: headerDiv.offsetHeight,
      });
      document.body.removeChild(headerDiv);

      // 채팅 영역의 전체 높이 계산
      const chatElement = chatContainerRef.current;
      const originalHeight = chatElement.style.height;
      const originalOverflow = chatElement.style.overflow;
      
      // 스크롤 가능하도록 임시로 설정
      chatElement.style.height = 'auto';
      chatElement.style.overflow = 'visible';
      
      // 전체 스크롤 영역을 캔버스로 변환
      const canvas = await html2canvas(chatElement, {
        backgroundColor: '#f9fafb',
        scale: 2,
        logging: false,
        useCORS: true,
        scrollY: -window.scrollY,
        height: chatElement.scrollHeight,
        width: chatElement.scrollWidth,
      });

      // 원래 스타일 복원
      chatElement.style.height = originalHeight;
      chatElement.style.overflow = originalOverflow;

      // PDF 생성
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // 헤더 이미지 크기 계산
      const headerImgWidth = headerCanvas.width;
      const headerImgHeight = headerCanvas.height;
      const headerRatio = pdfWidth / headerImgWidth;
      const headerScaledWidth = headerImgWidth * headerRatio;
      const headerScaledHeight = headerImgHeight * headerRatio;

      // 채팅 이미지 크기 계산
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      const imgScaledWidth = imgWidth * ratio;
      const imgScaledHeight = imgHeight * ratio;

      // 헤더 이미지를 PDF 상단에 추가
      pdf.addImage(headerCanvas.toDataURL('image/png'), 'PNG', 0, 0, headerScaledWidth, headerScaledHeight);
      
      let yPosition = headerScaledHeight + 5; // 헤더 아래 여백 포함
      const pageHeight = pdfHeight - 5; // 하단 여백 고려
      let heightLeft = imgScaledHeight;
      let position = 0;

      // 첫 페이지에 채팅 이미지 추가
      const firstPageAvailableHeight = pageHeight - yPosition;
      const firstPageHeight = Math.min(firstPageAvailableHeight, imgScaledHeight);
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, yPosition, imgScaledWidth, imgScaledHeight);
      heightLeft -= firstPageHeight;
      position = firstPageHeight;

      // 나머지 페이지들 추가
      while (heightLeft > 0) {
        pdf.addPage();
        const pageImgHeight = Math.min(pageHeight, heightLeft);
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, -(position - yPosition), imgScaledWidth, imgScaledHeight);
        position += pageImgHeight;
        heightLeft -= pageImgHeight;
      }

      // 파일명 생성 (학번 + 철학자 이름 + 날짜)
      const date = new Date().toISOString().split('T')[0];
      const studentId = studentInfo.trim().split(' ')[0] || '학생';
      const fileName = `${studentId}_${topic.philosopher}_${date}.pdf`;
      
      pdf.save(fileName);
    } catch (error) {
      console.error('PDF 저장 중 오류 발생:', error);
      alert('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  }, [messages, topic, isSaving, studentInfo, reflection]);

  return (
    <div className="bg-white rounded-2xl shadow-xl flex flex-col h-[85vh] sm:h-[85vh] max-h-[800px] min-h-[500px] border-2 border-purple-100">
      <header className="flex items-center p-2 sm:p-4 border-b border-purple-100 shrink-0 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
        <button onClick={onBack} className="p-2 sm:p-2 rounded-full hover:bg-purple-100 active:bg-purple-200 transition-colors text-purple-600 min-w-[44px] min-h-[44px] flex items-center justify-center">
          <BackIcon/>
        </button>
        <div className="ml-2 sm:ml-4 flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <div className="flex flex-col items-center flex-shrink-0">
            <button
              onClick={() => setShowProfileModal(true)}
              className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-visible border-2 border-white shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 min-w-[44px] min-h-[44px] group"
              title="프로필 보기"
            >
              <div className="w-full h-full rounded-full overflow-hidden">
                <img 
                  src={topic.imageUrl} 
                  alt={topic.philosopher}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* 정보 아이콘 오버레이 */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-md border-2 border-white group-hover:bg-blue-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </button>
            <p className="text-xs sm:text-sm text-gray-600 font-semibold mt-1">{topic.philosopher}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 hidden sm:block">클릭하여 프로필 보기</p>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-2xl font-bold text-gray-800 break-words">{topic.question}</h2>
          </div>
        </div>
      </header>

      <div className="p-2 sm:p-4 border-b border-purple-100 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => setIsTextbookVisible(prev => !prev)}
            className="flex-1 flex items-center justify-center px-3 sm:px-4 py-3 sm:py-2 font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl hover:from-blue-600 hover:to-cyan-600 active:from-blue-700 active:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300 transition-all shadow-md hover:shadow-lg min-h-[44px] text-sm sm:text-base"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="hidden sm:inline">{isTextbookVisible ? '교과서 닫기' : '교과서 읽기'}</span>
            <span className="sm:hidden">{isTextbookVisible ? '닫기' : '교과서'}</span>
          </button>
          <button
            onClick={() => setIsVideoVisible(prev => !prev)}
            className="flex-1 flex items-center justify-center px-3 sm:px-4 py-3 sm:py-2 font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:from-purple-600 hover:to-pink-600 active:from-purple-700 active:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-300 transition-all shadow-md hover:shadow-lg min-h-[44px] text-sm sm:text-base"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
              {isVideoVisible 
                ? <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              }
            </svg>
            <span className="hidden sm:inline">{isVideoVisible ? '영상 닫기' : '영상 보기'}</span>
            <span className="sm:hidden">{isVideoVisible ? '닫기' : '영상'}</span>
          </button>
        </div>
        {isTextbookVisible && (
          <div className="mt-4">
            <img 
              src={getTextbookImagePath(topic.philosopher)} 
              alt={`${topic.philosopher} 교과서`}
              className="w-full rounded-lg shadow-md"
            />
          </div>
        )}
        {isVideoVisible && (
          <div className="mt-4">
            {topic.videoUrl.endsWith('.mp4') ? (
              <video key={topic.id} controls src={topic.videoUrl} className="w-full rounded-lg aspect-video" playsInline>
                브라우저가 비디오 태그를 지원하지 않습니다.
              </video>
            ) : (
              <iframe 
                key={topic.id}
                src={topic.videoUrl} 
                className="w-full rounded-lg aspect-video border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                title={`'${topic.question}'에 대한 영상`}>
              </iframe>
            )}
          </div>
        )}
      </div>

      <div ref={chatContainerRef} className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 bg-gradient-to-b from-purple-50/30 via-pink-50/30 to-blue-50/30" style={{ WebkitOverflowScrolling: 'touch' }}>
        {messages.map((msg, index) => (
          <ChatBubble key={index} message={msg} philosopher={topic.philosopher} philosopherImage={topic.imageUrl} />
        ))}
        
        {/* 추천 질문 표시: 철학자가 답변한 후에만 표시 */}
        {!isLoading && 
         messages.length > 0 && 
         messages[messages.length - 1].role === 'model' && 
         (isGeneratingSuggestions || suggestedQuestions.length > 0) && (
          <div className="flex flex-col gap-2 mt-4">
            <p className="text-sm text-gray-500 text-center mb-2">
              {isGeneratingSuggestions ? '💡 추천 질문을 생성하고 있습니다...' : '💡 이런 질문은 어떠신가요?'}
            </p>
            {isGeneratingSuggestions ? (
              <div className="bg-white border-2 border-purple-200 rounded-xl px-4 py-3 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse [animation-delay:0.4s]"></div>
                </div>
              </div>
            ) : (
              suggestedQuestions.map((suggestedQ, idx) => (
                <button
                  key={idx}
                  onClick={() => sendQuestion(suggestedQ, true)}
                  disabled={isLoading}
                  className="bg-white border-2 border-purple-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:border-purple-400 hover:bg-purple-50 active:bg-purple-100 active:border-purple-500 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] w-full"
                >
                  <span className="text-gray-700 font-medium text-sm sm:text-base break-words">{suggestedQ}</span>
                </button>
              ))
            )}
          </div>
        )}

        {isLoading && messages[messages.length-1].role === 'user' && (
             <div className="flex items-start space-x-3">
                <img src={topic.imageUrl} alt={topic.philosopher} className="w-10 h-10 rounded-lg object-cover" />
                 <div className="flex flex-col items-start">
                    <p className="text-sm text-gray-700 mb-1">{topic.philosopher}</p>
                    <div className="bg-white rounded-lg rounded-tl-none p-3 max-w-lg shadow">
                       <div className="flex items-center justify-center space-x-2 h-6">
                            <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse [animation-delay:0.2s]"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse [animation-delay:0.4s]"></div>
                        </div>
                    </div>
                 </div>
            </div>
        )}
      </div>

      <div className="p-2 sm:p-4 border-t border-purple-100 bg-gradient-to-r from-white to-purple-50/50 rounded-b-2xl shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2 sm:space-x-3">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="궁금한 점을 질문해보세요..."
            className="flex-1 w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-purple-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 bg-white shadow-sm text-base"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="p-2.5 sm:p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 active:from-blue-700 active:to-cyan-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <SendIcon />
          </button>
          <button
            type="button"
            onClick={handleSaveChat}
            disabled={isLoading || isSaving || messages.length === 0}
            className="p-2.5 sm:p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 active:from-blue-700 active:to-cyan-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="대화 저장"
          >
            <SaveIcon />
          </button>
        </form>
      </div>

      {/* 저장 모달 */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowSaveModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-2 sm:mx-4 p-4 sm:p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">대화 내용 저장</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">대화 내용을 PDF로 저장합니다.</p>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  학번과 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={studentInfo}
                  onChange={(e) => setStudentInfo(e.target.value)}
                  placeholder="예) 10101 김철학"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 bg-white text-base"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {topic.philosopher}와 대화를 나눈 소감
                </label>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="이번 대화에서 느낀 점이나 생각을 자유롭게 적어주세요..."
                  rows={5}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 bg-white resize-none text-base"
                />
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[44px] text-sm sm:text-base"
              >
                취소
              </button>
              <button
                onClick={handleSaveConfirm}
                disabled={isSaving || !studentInfo.trim()}
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-xl hover:from-blue-600 hover:to-cyan-600 active:from-blue-700 active:to-cyan-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-md min-h-[44px] text-sm sm:text-base"
              >
                {isSaving ? '저장 중...' : '저장하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 철학자 프로필 모달 */}
      {showProfileModal && PHILOSOPHER_PROFILES[topic.philosopher] && (
        <PhilosopherProfileModal
          profile={PHILOSOPHER_PROFILES[topic.philosopher]}
          imageUrl={topic.imageUrl}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
};

export default ChatView;