import React from 'react';

interface GuideModalProps {
  onClose: () => void;
  onDontShowAgain: () => void;
}

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const GuideModal: React.FC<GuideModalProps> = ({ onClose, onDontShowAgain }) => {
  const handleClose = () => {
    onClose();
  };

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
          <div>
            <h2 className="text-2xl font-bold text-gray-800">철학자와 도란도란 ☕</h2>
            <p className="text-sm text-gray-600 mt-1">앱 사용 가이드</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-purple-100 transition-colors text-purple-600"
          >
            <CloseIcon />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 space-y-6">
          {/* 앱 소개 */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-purple-600">✨</span> 앱 소개
            </h3>
            <p className="text-gray-700 leading-relaxed bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-xl p-4">
              <strong>철학자와 도란도란</strong>은 AI 철학자와 대화하며 깊이 있는 질문의 답을 찾아보는 교육용 챗봇 앱입니다. 
              교과서에 등장하는 여러 철학자들과 대화하며 철학적 사고를 확장해보세요.
            </p>
          </div>

          {/* 사용 방법 */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-purple-600">📚</span> 사용 방법
            </h3>
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border-l-4 border-blue-400">
                <h4 className="font-semibold text-gray-800 mb-2">1. 철학자와 질문 선택</h4>
                <p className="text-gray-700 text-sm">
                  메인 화면에서 관심 있는 철학적 질문 카드를 선택하세요. 각 카드는 다른 철학자와의 대화 주제를 나타냅니다.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border-l-4 border-blue-400">
                <h4 className="font-semibold text-gray-800 mb-2">2. 교과서 및 영상 보기</h4>
                <p className="text-gray-700 text-sm">
                  대화 전 '교과서 읽기' 버튼을 클릭하면 관련 교과서 내용을, '영상 보기' 버튼을 클릭하면 관련 영상을 볼 수 있습니다.
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border-l-4 border-blue-400">
                <h4 className="font-semibold text-gray-800 mb-2">3. 철학자 프로필 보기</h4>
                <p className="text-gray-700 text-sm">
                  대화 화면 상단의 철학자 사진을 클릭하면 해당 철학자의 기본 정보, 주요 사상, 명언 등을 확인할 수 있습니다.
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border-l-4 border-blue-400">
                <h4 className="font-semibold text-gray-800 mb-2">4. 철학자와 대화하기</h4>
                <p className="text-gray-700 text-sm">
                  선택한 철학자가 첫 질문에 대한 답을 제공합니다. 하단의 입력창에서 궁금한 점을 질문하거나, 추천 질문을 클릭하여 대화를 이어가세요.
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border-l-4 border-blue-400">
                <h4 className="font-semibold text-gray-800 mb-2">5. 대화 저장하기</h4>
                <p className="text-gray-700 text-sm">
                  대화 내용을 PDF로 저장할 수 있습니다. 저장 버튼을 클릭하고 학번과 이름, 소감을 입력한 후 저장하세요.
                </p>
              </div>
            </div>
          </div>

          {/* 주요 기능 */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-purple-600">🎯</span> 주요 기능
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
                <div className="font-semibold text-gray-800 mb-1">💬 AI 철학자와 대화</div>
                <p className="text-xs text-gray-600">철학자와 실시간 대화</p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
                <div className="font-semibold text-gray-800 mb-1">👤 철학자 프로필</div>
                <p className="text-xs text-gray-600">철학자 정보 확인</p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
                <div className="font-semibold text-gray-800 mb-1">💡 추천 질문</div>
                <p className="text-xs text-gray-600">자동 생성된 질문</p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
                <div className="font-semibold text-gray-800 mb-1">💾 저장 기능</div>
                <p className="text-xs text-gray-600">PDF로 대화 저장</p>
              </div>
            </div>
          </div>

          {/* 팁 */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-purple-600">💡</span> 팁
            </h3>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border-l-4 border-yellow-400">
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>철학자가 답변한 후 나타나는 추천 질문을 활용하면 더 깊이 있는 대화를 나눌 수 있습니다.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>철학자 프로필을 먼저 확인하면 해당 철학자의 사상을 이해하는 데 도움이 됩니다.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>교과서와 영상 자료를 함께 보면 더 풍부한 학습이 가능합니다.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 하단 */}
        <div className="sticky bottom-0 bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-t border-purple-100 rounded-b-2xl flex items-center justify-between">
          {/* Footer */}
          <div className="text-left">
            <p className="text-sm mb-1 text-gray-700 font-medium">행복한 수학, 함께 만들어요! 😊</p>
            <p className="text-xs text-gray-600">
              © 행복한윤쌤 |{' '}
              <a 
                href="https://blog.naver.com/happy_yoonssam" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 underline"
              >
                https://blog.naver.com/happy_yoonssam
              </a>
            </p>
          </div>
          
          {/* 시작하기 버튼 */}
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-md flex-shrink-0"
          >
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuideModal;

