
import React from 'react';
import type { Topic } from '../types';
import TopicCard from './TopicCard';

interface TopicSelectionViewProps {
  topics: Topic[];
  onTopicSelect: (topic: Topic) => void;
}

const TopicSelectionView: React.FC<TopicSelectionViewProps> = ({ topics, onTopicSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {topics.map((topic) => (
        <TopicCard key={topic.id} topic={topic} onClick={() => onTopicSelect(topic)} />
      ))}
    </div>
  );
};

export default TopicSelectionView;
