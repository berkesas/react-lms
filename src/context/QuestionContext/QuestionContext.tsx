import { createContext, useContext } from 'react';
import type { QuestionConfig, QuestionAnswer, SubmissionStatus, Feedback, ContentRenderer } from '../../types';

export interface QuestionContextValue<T = any> {
  config: QuestionConfig;
  answer: QuestionAnswer<T>;
  setAnswer: (value: T) => void;
  clearAnswer: () => void;
  status: SubmissionStatus;
  setStatus: (status: SubmissionStatus) => void;
  attemptNumber: number;
  incrementAttempt: () => void;
  timeSpent: number;
  isAnswered: boolean;
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
  validate: () => Promise<void>;
  showFeedback: boolean;
  feedback?: Feedback;
  isLocked: boolean;
  onSubmit?: () => void;
  renderContent?: ContentRenderer;
}

const QuestionContext = createContext<QuestionContextValue | null>(null);

export const useQuestionContext = <T = any,>(): QuestionContextValue<T> => {
  const context = useContext(QuestionContext);
  if (!context) {
    throw new Error('useQuestionContext must be used within a QuestionProvider');
  }
  return context as QuestionContextValue<T>;
};

export const QuestionProvider = QuestionContext.Provider;

export default QuestionContext;