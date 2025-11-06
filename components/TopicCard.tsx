
import React from 'react';
import type { Topic } from '../types';

interface TopicCardProps {
  topic: Topic;
  onClick: () => void;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, onClick }) => {
  // 각 철학자별 파스텔 색상 매핑
  const colorMap: Record<string, { bg: string; border: string; icon: string }> = {
    '장자': { bg: 'bg-pink-50', border: 'border-pink-200', icon: '🦋' },
    '소크라테스': { bg: 'bg-purple-50', border: 'border-purple-200', icon: '💭' },
    '존 스튜어트 밀': { bg: 'bg-blue-50', border: 'border-blue-200', icon: '📜' },
    '밀': { bg: 'bg-blue-50', border: 'border-blue-200', icon: '📜' },
    '키케로': { bg: 'bg-green-50', border: 'border-green-200', icon: '🤝' },
    '하이데거': { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: '🌌' },
    '정약용': { bg: 'bg-amber-50', border: 'border-amber-200', icon: '📖' },
    '롤스': { bg: 'bg-cyan-50', border: 'border-cyan-200', icon: '⚖️' },
  };

  const colors = colorMap[topic.philosopher] || { bg: 'bg-purple-50', border: 'border-purple-200', icon: '💫' };

  return (
    <button
      onClick={onClick}
      className={`${colors.bg} ${colors.border} border-2 rounded-2xl shadow-sm p-4 sm:p-6 text-left hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-opacity-50 group min-h-[120px] sm:min-h-[140px]`}
    >
      <div className="flex flex-col">
        <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="text-2xl sm:text-3xl flex-shrink-0">{colors.icon}</div>
          <h2 className="text-base sm:text-xl font-bold text-gray-800 flex-1 group-hover:text-purple-600 transition-colors break-words">{topic.question}</h2>
        </div>
        <div className="flex items-center justify-center gap-2 mt-2 sm:mt-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
            <img 
              src={topic.imageUrl} 
              alt={topic.philosopher}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-gray-600 font-bold text-base sm:text-lg">{topic.philosopher}</p>
        </div>
      </div>
    </button>
  );
};

export default TopicCard;
