import { createContext, useContext } from 'react';
import type { UseQuizStateReturn } from '../../hooks/quiz/useQuizState';

export type QuizContextValue = UseQuizStateReturn;

const QuizContext = createContext<QuizContextValue | null>(null);

export const useQuizContext = (): QuizContextValue => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuizContext must be used within a QuizProvider');
  }
  return context;
};

export const QuizProvider = QuizContext.Provider;

export default QuizContext;