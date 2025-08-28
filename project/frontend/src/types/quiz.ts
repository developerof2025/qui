export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  _id?: string;
  id: string;
  code: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  questions: Question[];
  createdAt: Date;
  createdBy: string;
}

export interface QuizResult {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
}

export interface QuizGenerationRequest {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  numberOfQuestions: number;
}

export interface QuizReport {
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  performance: 'Poor' | 'Good' | 'Excellent';
  completedAt: Date;
}