import { useState, useCallback, useMemo, useEffect } from 'react';
import type { 
  QuizConfig, 
  QuizState, 
  QuizResult, 
  QuizProgress 
} from '../../types/quiz';
import type { QuestionAnswer, QuestionSubmission, QuestionConfig } from '../../types';

export interface UseQuizStateOptions {
  config: QuizConfig;
  onAnswerChange?: (questionId: string, answer: QuestionAnswer) => void;
  onQuestionSubmit?: (submission: QuestionSubmission) => void;
  onQuizSubmit?: (result: QuizResult) => void;
  onProgressChange?: (progress: QuizProgress) => void;
  initialAnswers?: Map<string, QuestionAnswer>;
}

export interface UseQuizStateReturn {
  state: QuizState;
  progress: QuizProgress;
  
  // Navigation
  currentQuestion: QuestionConfig | null;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  
  // Answer management
  setAnswer: (questionId: string, answer: QuestionAnswer) => void;
  getAnswer: (questionId: string) => QuestionAnswer | undefined;
  clearAnswer: (questionId: string) => void;
  clearAllAnswers: () => void;
  
  // Submission
  submitQuestion: (questionId: string) => Promise<void>;
  submitQuiz: () => Promise<QuizResult>;
  canSubmitQuiz: boolean;
  
  // Review mode
  isReviewMode: boolean;
  enterReviewMode: () => void;
  exitReviewMode: () => void;
}

export function useQuizState(options: UseQuizStateOptions): UseQuizStateReturn {
  const { 
    config, 
    onAnswerChange, 
    onQuestionSubmit,
    onQuizSubmit,
    onProgressChange,
    initialAnswers 
  } = options;

  // Initialize state
  const [state, setState] = useState<QuizState>(() => ({
    config,
    currentQuestionIndex: 0,
    answers: initialAnswers || new Map(),
    submissions: new Map(),
    status: 'not-started',
    attemptNumber: 1,
    totalTimeSpent: 0,
    maxScore: config.questions.reduce((sum, q) => sum + q.points, 0),
  }));

  const [isReviewMode, setIsReviewMode] = useState(false);
  const [startTime] = useState(Date.now());

  // Update time spent
  useEffect(() => {
    if (state.status === 'in-progress') {
      const interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          totalTimeSpent: Math.floor((Date.now() - startTime) / 1000),
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
    
    return undefined;
  }, [state.status, startTime]);

  // Calculate progress
  const progress: QuizProgress = useMemo(() => {
    const totalQuestions = config.questions.length;
    const answeredQuestions = Array.from(state.answers.values()).filter(
      a => a.isAnswered
    ).length;

    return {
      totalQuestions,
      answeredQuestions,
      currentQuestionIndex: state.currentQuestionIndex,
      percentComplete: (answeredQuestions / totalQuestions) * 100,
      timeSpent: state.totalTimeSpent,
      timeRemaining: config.timeLimit 
        ? Math.max(0, config.timeLimit - state.totalTimeSpent)
        : undefined,
    };
  }, [config, state.answers, state.currentQuestionIndex, state.totalTimeSpent]);

  // Notify progress changes
  useEffect(() => {
    if (onProgressChange) {
      onProgressChange(progress);
    }
  }, [progress, onProgressChange]);

  // Get current question
  const currentQuestion = useMemo(() => {
    return config.questions[state.currentQuestionIndex] || null;
  }, [config.questions, state.currentQuestionIndex]);

  // Navigation helpers
  const canGoNext = useMemo(() => {
    const hasNext = state.currentQuestionIndex < config.questions.length - 1;
    if (!config.allowSkip && !config.allowNavigation) {
      const currentAnswer = currentQuestion 
        ? state.answers.get(currentQuestion.id)
        : undefined;
      return hasNext && currentAnswer?.isAnswered === true;
    }
    return hasNext;
  }, [state.currentQuestionIndex, config, currentQuestion, state.answers]);

  const canGoPrevious = useMemo(() => {
    return (config.allowNavigation ?? false) && state.currentQuestionIndex > 0;
  }, [config.allowNavigation, state.currentQuestionIndex]);

  // Navigation functions
  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < config.questions.length) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: index,
        status: prev.status === 'not-started' ? 'in-progress' : prev.status,
      }));
    }
  }, [config.questions.length]);

  const nextQuestion = useCallback(() => {
    if (canGoNext) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
    }
  }, [canGoNext]);

  const previousQuestion = useCallback(() => {
    if (canGoPrevious) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
      }));
    }
  }, [canGoPrevious]);

  // Answer management
  const setAnswer = useCallback((questionId: string, answer: QuestionAnswer) => {
    setState(prev => {
      const newAnswers = new Map(prev.answers);
      newAnswers.set(questionId, answer);

      return {
        ...prev,
        answers: newAnswers,
        status: prev.status === 'not-started' ? 'in-progress' : prev.status,
      };
    });

    if (onAnswerChange) {
      onAnswerChange(questionId, answer);
    }
  }, [onAnswerChange]);

  const getAnswer = useCallback((questionId: string) => {
    return state.answers.get(questionId);
  }, [state.answers]);

  const clearAnswer = useCallback((questionId: string) => {
    setState(prev => {
      const newAnswers = new Map(prev.answers);
      newAnswers.delete(questionId);

      return {
        ...prev,
        answers: newAnswers,
      };
    });
  }, []);

  const clearAllAnswers = useCallback(() => {
    setState(prev => ({
      ...prev,
      answers: new Map(),
      submissions: new Map(),
    }));
  }, []);

  // Submit individual question (for question-level or hybrid mode)
  const submitQuestion = useCallback(async (questionId: string) => {
    const answer = state.answers.get(questionId);
    if (!answer) return;

    const question = config.questions.find(q => q.id === questionId);
    if (!question) return;

    const submission: QuestionSubmission = {
      questionId,
      answer,
      status: 'submitted',
      maxScore: question.points,
      submittedAt: new Date().toISOString(),
    };

    setState(prev => {
      const newSubmissions = new Map(prev.submissions);
      newSubmissions.set(questionId, submission);

      return {
        ...prev,
        submissions: newSubmissions,
      };
    });

    if (onQuestionSubmit) {
      onQuestionSubmit(submission);
    }
  }, [state.answers, config.questions, onQuestionSubmit]);

  // Submit entire quiz
  const submitQuiz = useCallback(async (): Promise<QuizResult> => {
    // Mark all unanswered questions
    const allSubmissions: QuestionSubmission[] = config.questions.map(question => {
      const answer = state.answers.get(question.id);
      const existingSubmission = state.submissions.get(question.id);

      if (existingSubmission) {
        return existingSubmission;
      }

      return {
        questionId: question.id,
        answer: answer || {
          questionId: question.id,
          value: null,
          isAnswered: false,
          attemptNumber: state.attemptNumber,
        },
        status: 'submitted',
        maxScore: question.points,
        submittedAt: new Date().toISOString(),
      };
    });

    const result: QuizResult = {
      quizId: config.id,
      answers: Array.from(state.answers.values()),
      submissions: allSubmissions,
      score: 0, // Will be calculated by grading logic
      maxScore: state.maxScore,
      percentage: 0,
      isPassed: false,
      timeSpent: state.totalTimeSpent,
      attemptNumber: state.attemptNumber,
      submittedAt: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      status: 'submitted',
      submittedAt: result.submittedAt,
    }));

    if (onQuizSubmit) {
      onQuizSubmit(result);
    }

    return result;
  }, [config, state, onQuizSubmit]);

  // Check if quiz can be submitted
  const canSubmitQuiz = useMemo(() => {
    if (state.status === 'submitted' || state.status === 'graded') {
      return false;
    }

    if (config.requireAllAnswered) {
      return progress.answeredQuestions === progress.totalQuestions;
    }

    return progress.answeredQuestions > 0;
  }, [state.status, config.requireAllAnswered, progress]);

  // Review mode
  const enterReviewMode = useCallback(() => {
    setIsReviewMode(true);
  }, []);

  const exitReviewMode = useCallback(() => {
    setIsReviewMode(false);
  }, []);

  return {
    state,
    progress,
    currentQuestion,
    goToQuestion,
    nextQuestion,
    previousQuestion,
    canGoNext,
    canGoPrevious,
    setAnswer,
    getAnswer,
    clearAnswer,
    clearAllAnswers,
    submitQuestion,
    submitQuiz,
    canSubmitQuiz,
    isReviewMode,
    enterReviewMode,
    exitReviewMode,
  };
}