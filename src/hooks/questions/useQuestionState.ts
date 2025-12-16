import { useState, useCallback, useEffect } from 'react';
import type { QuestionConfig, QuestionAnswer, SubmissionStatus } from '../../types';

export interface UseQuestionStateOptions<T = any> {
  config: QuestionConfig;
  initialAnswer?: T;
  onAnswerChange?: (answer: QuestionAnswer<T>) => void;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export interface UseQuestionStateReturn<T = any> {
  answer: QuestionAnswer<T>;
  setAnswer: (value: T) => void;
  clearAnswer: () => void;
  status: SubmissionStatus;
  setStatus: (status: SubmissionStatus) => void;
  attemptNumber: number;
  incrementAttempt: () => void;
  timeSpent: number;
  isAnswered: boolean;
}

export function useQuestionState<T = any>(
  options: UseQuestionStateOptions<T>
): UseQuestionStateReturn<T> {
  const { config, initialAnswer, onAnswerChange, autoSave = false, autoSaveDelay = 1000 } = options;

  // Answer state
  const [answer, setAnswerState] = useState<QuestionAnswer<T>>({
    questionId: config.id,
    value: initialAnswer as T,
    isAnswered: false,
    attemptNumber: 1,
    timeSpent: 0,
    timestamp: new Date().toISOString(),
  });

  // Submission status
  const [status, setStatus] = useState<SubmissionStatus>('not-started');

  // Attempt tracking
  const [attemptNumber, setAttemptNumber] = useState(1);

  // Time tracking
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());

  // Update time spent every second
  useEffect(() => {
    if (status === 'in-progress' || status === 'not-started') {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setTimeSpent(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    }
    
    return undefined;
  }, [status, startTime]);

  // Set answer with change callback
  const setAnswer = useCallback(
    (value: T) => {
      const newAnswer: QuestionAnswer<T> = {
        questionId: config.id,
        value,
        isAnswered: value !== null && value !== undefined && value !== '',
        attemptNumber,
        timeSpent,
        timestamp: new Date().toISOString(),
      };

      setAnswerState(newAnswer);

      // Update status to in-progress if not already
      if (status === 'not-started') {
        setStatus('in-progress');
      }

      // Trigger callback
      if (onAnswerChange) {
        onAnswerChange(newAnswer);
      }
    },
    [config.id, attemptNumber, timeSpent, status, onAnswerChange]
  );

  // Clear answer
  const clearAnswer = useCallback(() => {
    const clearedAnswer: QuestionAnswer<T> = {
      questionId: config.id,
      value: undefined as T,
      isAnswered: false,
      attemptNumber,
      timeSpent,
      timestamp: new Date().toISOString(),
    };

    setAnswerState(clearedAnswer);

    if (onAnswerChange) {
      onAnswerChange(clearedAnswer);
    }
  }, [config.id, attemptNumber, timeSpent, onAnswerChange]);

  // Increment attempt
  const incrementAttempt = useCallback(() => {
    setAttemptNumber((prev) => prev + 1);
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (autoSave && answer.isAnswered) {
      const timeout = setTimeout(() => {
        // Here you would trigger save logic
        console.log('Auto-saving answer:', answer);
      }, autoSaveDelay);

      return () => clearTimeout(timeout);
    }
    
    return undefined;
  }, [autoSave, autoSaveDelay, answer]);

  return {
    answer,
    setAnswer,
    clearAnswer,
    status,
    setStatus,
    attemptNumber,
    incrementAttempt,
    timeSpent,
    isAnswered: answer.isAnswered,
  };
}