export interface Topic {
  id: number;
  question: string;
  philosopher: string;
  initialAnswer: string;
  videoUrl: string;
  imageUrl: string;
  suggestedQuestions?: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
