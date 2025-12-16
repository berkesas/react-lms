import type { QuestionConfig, QuestionAnswer, QuestionSubmission } from './questions';

/**
 * Quiz/Assessment types for managing collections of questions
 */

export type SubmissionMode = 'question-level' | 'quiz-level' | 'hybrid';

export interface QuizConfig {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  submissionMode: SubmissionMode;
  
  // Questions
  questions: QuestionConfig[];
  
  // Navigation
  allowNavigation?: boolean; // Can users navigate between questions?
  allowSkip?: boolean; // Can users skip questions?
  randomizeQuestions?: boolean;
  
  // Timing
  timeLimit?: number; // Total time limit in seconds
  showTimer?: boolean;
  
  // Submission rules
  requireAllAnswered?: boolean; // Must answer all questions before submitting
  allowReview?: boolean; // Can review answers before final submission
  maxAttempts?: number; // Max attempts for entire quiz
  
  // Scoring
  passingScore?: number; // Percentage needed to pass
  showScore?: boolean; // Show score after submission
  
  // Feedback
  showFeedbackOnSubmit?: boolean;
  showCorrectAnswers?: boolean;
  
  // Auto-save
  autoSave?: boolean;
  autoSaveInterval?: number; // in seconds
}

export interface QuizState {
  config: QuizConfig;
  currentQuestionIndex: number;
  answers: Map<string, QuestionAnswer>; // questionId -> answer
  submissions: Map<string, QuestionSubmission>; // questionId -> submission
  status: 'not-started' | 'in-progress' | 'submitted' | 'graded';
  attemptNumber: number;
  startedAt?: string;
  submittedAt?: string;
  totalTimeSpent: number;
  score?: number;
  maxScore: number;
  isPassed?: boolean;
}

export interface QuizResult {
  quizId: string;
  answers: QuestionAnswer[];
  submissions: QuestionSubmission[];
  score: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  timeSpent: number;
  attemptNumber: number;
  submittedAt: string;
}

export interface QuizProgress {
  totalQuestions: number;
  answeredQuestions: number;
  currentQuestionIndex: number;
  percentComplete: number;
  timeSpent: number;
  timeRemaining?: number;
}