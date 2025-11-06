import React from 'react';
import type { ChatMessage } from '../types';
import { marked } from 'marked';

interface ChatBubbleProps {
  message: ChatMessage;
  philosopher: string;
  philosopherImage?: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, philosopher, philosopherImage }) => {
  const isModel = message.role === 'model';
  
  const parsedContent = marked.parse(message.content) as string;

  if (isModel) {
    return (
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0">
          <img src={philosopherImage} alt={philosopher} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col items-start flex-1 min-w-0">
            <p className="text-sm text-purple-600 font-medium mb-1">{philosopher}</p>
            <div
                className="bg-white rounded-2xl rounded-tl-none p-4 max-w-lg prose prose-sm max-w-none shadow-md border border-purple-100 prose-p:text-gray-900 prose-p:font-semibold prose-strong:text-gray-900 prose-strong:font-bold break-words overflow-wrap-anywhere"
                style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                dangerouslySetInnerHTML={{ __html: parsedContent }}
            />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <div
        className="bg-yellow-300 rounded-2xl rounded-br-none p-4 max-w-lg prose prose-sm max-w-none text-gray-800 shadow-md prose-p:text-gray-800 prose-p:font-bold prose-strong:text-gray-800 prose-strong:font-bold break-words overflow-wrap-anywhere"
        style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
        dangerouslySetInnerHTML={{ __html: parsedContent }}
      />
    </div>
  );
};

export default ChatBubble;
