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
  statistics?: {
    totalAttempts: number;
    averageScore: number;
    performanceBreakdown: {
      excellent: number;
      good: number;
      poor: number;
    };
  };
}

export interface QuizResultDetail {
  _id: string;
  quizId: string;
  userId: string;
  userName: string;
  userEmail: string;
  answers: Array<{
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
  }>;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  performance: 'Poor' | 'Good' | 'Excellent';
  timeSpent: number;
  createdAt: string;
}

export interface QuizResultsResponse {
  quiz: {
    _id: string;
    topic: string;
    code: string;
    difficulty: string;
    category: string;
  };
  results: QuizResultDetail[];
}

export interface QuizResult {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
}

export interface QuizReport {
  resultId?: string;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  performance: 'Poor' | 'Good' | 'Excellent';
  completedAt: Date;
  timeSpent?: number;
  analysis: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    categoryBreakdown: Array<{
      category: string;
      correct: number;
      total: number;
      percentage: number;
    }>;
    difficultyAnalysis: {
      easy: { correct: number; total: number };
      medium: { correct: number; total: number };
      hard: { correct: number; total: number };
    };
  };
  results: Array<{
    questionId: string;
    question: string;
    options: string[];
    selectedAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    explanation: string;
  }>;
}