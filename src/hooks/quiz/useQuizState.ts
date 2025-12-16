import { useState, useCallback, useMemo, useEffect } from 'react';
import { gradeQuiz } from '../../utils/questions/grading';

import type {
  QuizConfig,
  QuizState,
  QuizResult,
  QuizProgress
} from '../../types/quiz';
import type { QuestionAnswer, QuestionSubmission, QuestionConfig, LoadedQuizResult } from '../../types';
import { QuizStorageManager } from '../../utils';

export interface UseQuizStateOptions {
  config: QuizConfig;
  onAnswerChange?: (questionId: string, answer: QuestionAnswer) => void;
  onQuestionSubmit?: (submission: QuestionSubmission) => void;
  onQuizSubmit?: (result: QuizResult) => void;
  onProgressChange?: (progress: QuizProgress) => void;
  initialAnswers?: Map<string, QuestionAnswer>;
  loadedResult?: LoadedQuizResult;
  storageManager?: QuizStorageManager;
  autoSaveInterval?: number;  // 0 = disabled, >0 = enabled with interval in ms
}

export interface UseQuizStateReturn {
  state: QuizState;
  progress: QuizProgress;
  loadedResult?: LoadedQuizResult;  // ADD THIS
  showingResults: boolean;  // ADD THIS
  showResults: () => void;  // ADD THIS
  hideResults: () => void;  // ADD THIS

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
    initialAnswers,
    loadedResult,
    storageManager,
    autoSaveInterval = 0,
  } = options;

  // Initialize state
  const [state, setState] = useState<QuizState>(() => {
    // If loading a previous result, populate answers
    const initialAnswersMap = loadedResult
      ? new Map(loadedResult.answers.map(ans => [ans.questionId, ans]))
      : (initialAnswers || new Map());

    return {
      config,
      currentQuestionIndex: 0,
      answers: initialAnswersMap,
      submissions: new Map(),
      status: loadedResult ? 'graded' : 'not-started',  // Set to graded if loaded
      attemptNumber: loadedResult ? loadedResult.attemptNumber : 1,
      totalTimeSpent: 0,
      maxScore: config.questions.reduce((sum, q) => sum + q.points, 0),
      score: loadedResult?.score,
    };
  });

  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showingResults, setShowingResults] = useState(!!loadedResult);
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

    // GRADE THE QUIZ AUTOMATICALLY
    const gradingResult = gradeQuiz(
      { questions: config.questions },
      state.answers
    );

    const result: QuizResult = {
      quizId: config.id,
      answers: Array.from(state.answers.values()),
      submissions: allSubmissions.map(sub => ({
        ...sub,
        score: gradingResult.results.get(sub.questionId)?.score || 0,
        feedback: gradingResult.results.get(sub.questionId)?.feedback
          ? [{
            type: gradingResult.results.get(sub.questionId)!.isCorrect ? 'correct' as const : 'incorrect' as const,
            message: gradingResult.results.get(sub.questionId)!.feedback!,
          }]
          : undefined,
      })),
      score: gradingResult.totalScore,  // ACTUAL SCORE
      maxScore: gradingResult.maxScore,
      percentage: gradingResult.percentage,
      isPassed: gradingResult.percentage >= (config.passingScore || 0),
      timeSpent: state.totalTimeSpent,
      attemptNumber: state.attemptNumber,
      submittedAt: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      status: 'graded',  // CHANGE TO GRADED
      submittedAt: result.submittedAt,
      score: result.score,  // STORE SCORE
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

  const showResults = useCallback(() => {
    setShowingResults(true);
  }, []);

  const hideResults = useCallback(() => {
    setShowingResults(false);
  }, []);

  useEffect(() => {
    // Only auto-save if interval > 0, storage manager exists, quiz is in progress, and has answers
    if (autoSaveInterval > 0 && storageManager && state.status === 'in-progress' && state.answers.size > 0) {
      // Debounce auto-save
      const timeout = setTimeout(async () => {
        try {
          // Create a partial result for auto-saving
          const partialResult: QuizResult = {
            quizId: config.id,
            answers: Array.from(state.answers.values()),
            submissions: Array.from(state.submissions.values()),
            score: 0,
            maxScore: state.maxScore,
            percentage: 0,
            isPassed: false,
            timeSpent: state.totalTimeSpent,
            attemptNumber: state.attemptNumber,
            submittedAt: new Date().toISOString(),
          };

          await storageManager.saveResult(partialResult);
          console.log('Quiz auto-saved');
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }, autoSaveInterval);

      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [
    state.answers,
    state.submissions,
    state.status,
    state.totalTimeSpent,
    autoSaveInterval,  // CHANGE THIS
    storageManager,
    config.id,
    state.maxScore,
    state.attemptNumber,
  ]);

  return {
    state,
    progress,
    loadedResult,
    showingResults,
    showResults,
    hideResults,
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