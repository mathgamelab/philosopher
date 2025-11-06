
import React, { useState, useEffect, useRef } from 'react';
import type { Topic } from './types';
import TopicSelectionView from './components/TopicSelectionView';
import ChatView from './components/ChatView';
import GuideModal from './components/GuideModal';
import { TOPICS } from './constants/topics';

const GUIDE_MODAL_KEY = 'philosopher-guide-seen';

const App: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // localStorage에서 가이드 모달을 이미 봤는지 확인
    const hasSeenGuide = localStorage.getItem(GUIDE_MODAL_KEY);
    if (!hasSeenGuide) {
      setShowGuideModal(true);
    }

    // 오디오 엘리먼트 생성
    audioRef.current = new Audio('/Kiss the Sky - Aakash Gandhi.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5; // 볼륨 50%로 설정

    // 가이드를 이미 본 경우 자동 재생 시도
    if (hasSeenGuide) {
      audioRef.current.play().catch((error) => {
        console.log('자동 재생 실패 (브라우저 정책):', error);
        setIsMusicPlaying(false); // 재생 실패 시 상태 업데이트
      });
    }

    return () => {
      // 컴포넌트 언마운트 시 정리
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleCloseGuide = () => {
    setShowGuideModal(false);
    // 가이드 모달을 닫을 때 음악 재생 시작 (사용자 상호작용 후이므로 재생 가능)
    if (audioRef.current && isMusicPlaying) {
      audioRef.current.play().catch((error) => {
        console.log('음악 재생 실패:', error);
        setIsMusicPlaying(false);
      });
    }
  };

  const handleDontShowAgain = () => {
    localStorage.setItem(GUIDE_MODAL_KEY, 'true');
  };

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
  };

  const handleBack = () => {
    setSelectedTopic(null);
  };

  const handleOpenTextbook = () => {
    window.open('/data/도덕 교과서 PDF.pdf', '_blank');
  };

  const handleToggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((error) => {
          console.error('음악 재생 실패:', error);
        });
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/data/쿼카.png)',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#FEECDB', // 배경색 추가 (여백 부분)
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-pink-50/50 to-blue-50/50"></div>
      <div className="container mx-auto max-w-4xl p-2 sm:p-4 relative z-10">
        <header className="flex flex-row items-center justify-between my-4 sm:my-8 gap-1 sm:gap-2">
          {/* 왼쪽 버튼들 - 모바일: 작은 이모지 버튼 가로 배치, 데스크톱: 전체 버튼 세로 배치 */}
          <div className="flex flex-row sm:flex-col gap-1 sm:gap-2 w-auto justify-start">
            {/* 모바일: 작은 이모지 버튼 - 가로 배치 */}
            <button
              onClick={handleOpenTextbook}
              className="flex sm:hidden items-center justify-center px-2 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg w-10 h-10 text-base"
            >
              📖
            </button>
            <button
              onClick={handleToggleMusic}
              className={`flex sm:hidden items-center justify-center px-2 py-2 font-semibold rounded-lg transition-all shadow-md hover:shadow-lg w-10 h-10 text-base ${
                isMusicPlaying
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                  : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600'
              }`}
            >
              ♬
            </button>
            
            {/* 데스크톱: 전체 버튼 - 세로 배치 */}
            <button
              onClick={handleOpenTextbook}
              className="hidden sm:flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl min-h-[44px] text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              교과서
            </button>
            <button
              onClick={handleToggleMusic}
              className={`hidden sm:flex items-center justify-center gap-2 px-4 py-2 font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl min-h-[44px] text-base ${
                isMusicPlaying
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                  : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600'
              }`}
            >
              <span className="text-lg">♬</span>
              배경음악
            </button>
          </div>
          
          {/* 제목과 부제목 - 중앙 */}
          <div className="flex-1 text-center">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-black mb-2 sm:mb-3">
              철학자와 도란도란 ☕
            </h1>
            <p className="hidden sm:block text-lg text-black mt-2 font-medium px-2">
              AI 철학자와 대화하며 깊이 있는 질문의 답을 찾아보세요 ✨
            </p>
          </div>
          
          {/* 오른쪽 공간 - 데스크톱에서만 표시 */}
          <div className="hidden sm:block w-[120px]"></div>
        </header>
        <main>
          {selectedTopic ? (
            <ChatView topic={selectedTopic} onBack={handleBack} />
          ) : (
            <TopicSelectionView topics={TOPICS} onTopicSelect={handleTopicSelect} />
          )}
        </main>
      </div>

      {/* 가이드 모달 */}
      {showGuideModal && (
        <GuideModal 
          onClose={handleCloseGuide}
          onDontShowAgain={handleDontShowAgain}
        />
      )}

    </div>
  );
};

export default App;
