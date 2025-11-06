import React from 'react';
import type { PhilosopherProfile } from '../constants/philosopherProfiles';

interface PhilosopherProfileModalProps {
  profile: PhilosopherProfile;
  imageUrl: string;
  onClose: () => void;
}

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PhilosopherProfileModal: React.FC<PhilosopherProfileModalProps> = ({ profile, imageUrl, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-t-2xl border-b border-purple-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
              <img 
                src={imageUrl} 
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
              <p className="text-sm text-gray-600">{profile.era} · {profile.nationality}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-purple-100 transition-colors text-purple-600"
          >
            <CloseIcon />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 space-y-6">
          {/* 기본 정보 */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-purple-600">📖</span> 기본 정보
            </h3>
            <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-xl p-4 space-y-2">
              {profile.birthYear && profile.deathYear && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700 min-w-[80px]">생몰년:</span>
                  <span className="text-gray-600">
                    {profile.birthYear > 0 ? profile.birthYear : `${Math.abs(profile.birthYear)}년 전`}
                    {profile.deathYear && (
                      <> ~ {profile.deathYear > 0 ? profile.deathYear : `${Math.abs(profile.deathYear)}년 전`}</>
                    )}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700 min-w-[80px]">국적:</span>
                <span className="text-gray-600">{profile.nationality}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700 min-w-[80px]">시대:</span>
                <span className="text-gray-600">{profile.era}</span>
              </div>
            </div>
          </div>

          {/* 설명 */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-purple-600">📝</span> 소개
            </h3>
            <p className="text-gray-700 leading-relaxed bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-xl p-4">
              {profile.description}
            </p>
          </div>

          {/* 주요 사상 */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-purple-600">💭</span> 주요 사상
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {profile.mainIdeas.map((idea, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 text-center font-medium text-gray-700 border border-blue-100"
                >
                  {idea}
                </div>
              ))}
            </div>
          </div>

          {/* 명언 */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-purple-600">💬</span> 명언
            </h3>
            <div className="space-y-3">
              {profile.quotes.map((quote, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border-l-4 border-yellow-400"
                >
                  <p className="text-gray-700 italic leading-relaxed">"{quote}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhilosopherProfileModal;

