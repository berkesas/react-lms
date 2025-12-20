import { ReactNode, useMemo } from 'react';
import { useQuizState } from '../../../hooks/quiz/useQuizState';
import { QuizProvider } from '../../../context/QuizContext';
import { QuizStorageManager } from '../../../utils';
import type {
  QuizConfig,
  QuizResult,
  LoadedQuizResult,
} from '../../../types/quiz';
import type { QuestionAnswer, QuestionSubmission } from '../../../types';

export interface QuizProps {
  config: QuizConfig;
  children?: ReactNode;
  onAnswerChange?: (questionId: string, answer: QuestionAnswer) => void;
  onQuestionSubmit?: (submission: QuestionSubmission) => void;
  onQuizSubmit?: (result: QuizResult) => void;
  onProgressChange?: (progress: any) => void;
  renderQuestion?: (question: any, index: number) => ReactNode;
  loadedResult?: LoadedQuizResult;
  storageManager?: QuizStorageManager;
  autoSaveInterval?: number;
  className?: string;
}

/**
 * Fisher-Yates shuffle algorithm for randomizing array order
 * @param array - Array to shuffle
 * @param seed - Optional seed for deterministic shuffling
 * @returns Shuffled copy of the array
 */
function shuffleArray<T>(array: T[], seed?: number): T[] {
  const shuffled = [...array];
  const random = seed ? seededRandom(seed) : Math.random;
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Seeded random number generator for consistent shuffling
 * @param seed - Seed value for reproducible randomness
 * @returns Random number generator function
 */
function seededRandom(seed: number) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

export function Quiz(props: QuizProps) {
  const {
    config,
    children,
    onAnswerChange,
    onQuestionSubmit,
    onQuizSubmit,
    onProgressChange,
    renderQuestion,
    loadedResult,
    storageManager,
    autoSaveInterval,
    className,
  } = props;

  // Shuffle questions if enabled, memoized to prevent re-shuffling on re-renders
  const processedConfig = useMemo(() => {
    if (config.shuffleQuestions) {
      // Use quiz ID as seed for consistent shuffling per quiz
      const seed = config.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return {
        ...config,
        questions: shuffleArray(config.questions, seed)
      };
    }
    return config;
  }, [config]);

  const quizState = useQuizState({
    config: processedConfig,
    onAnswerChange,
    onQuestionSubmit,
    onQuizSubmit,
    onProgressChange,
    loadedResult,
    storageManager,
    autoSaveInterval,
  });

  const { state, currentQuestion, showingResults } = quizState;

  // Calculate if quiz is passed
  const isPassed = processedConfig.passingScore
    ? ((state.score || 0) / state.maxScore) * 100 >= processedConfig.passingScore
    : false;

  // Default question renderer
  const defaultRenderQuestion = () => {
    if (!currentQuestion) return null;

    return (
      <div className="picolms-quiz-question-container">
        <div className="picolms-quiz-question-number">
          Question {state.currentQuestionIndex + 1} of {processedConfig.questions.length}
        </div>
      </div>
    );
  };

  if (showingResults && loadedResult) {
    return (
      <QuizProvider value={quizState}>
        <div className={`picolms-quiz-container ${className || ''}`}>
          <div className="picolms-quiz-header">
            <h1 className="picolms-quiz-title">{processedConfig.title}</h1>
            {processedConfig.description && (
              <p className="picolms-quiz-description">{processedConfig.description}</p>
            )}
          </div>
          {children}
        </div>
      </QuizProvider>
    );
  }

  return (
    <QuizProvider value={quizState}>
      <div className={`picolms-quiz-container ${className || ''}`}>
        <div className="picolms-quiz-header">
          <h1 className="picolms-quiz-title">{processedConfig.title}</h1>
          {processedConfig.description && (
            <p className="picolms-quiz-description">{processedConfig.description}</p>
          )}
          {processedConfig.instructions && (
            <div className="picolms-quiz-instructions">
              {processedConfig.instructions}
            </div>
          )}
        </div>

        {/* SHOW RESULTS IF SUBMITTED/GRADED */}
        {(state.status === 'submitted' || state.status === 'graded') &&
        processedConfig.showScore ? (
          <div className="picolms-quiz-results-summary">
            <h2 className="picolms-results-heading">Quiz Complete!</h2>
            <div className="picolms-results-score">
              {state.score} / {state.maxScore}
            </div>
            <div className="picolms-results-percentage">
              {(((state.score || 0) / state.maxScore) * 100).toFixed(1)}%
            </div>
            {processedConfig.passingScore && (
              <div className={`picolms-results-status ${isPassed ? 'picolms-results-passed' : 'picolms-results-failed'}`}>
                {isPassed ? '✓ Passed' : '✗ Did Not Pass'}
              </div>
            )}
          </div>
        ) : (
          <div className="picolms-quiz-content">
            {renderQuestion
              ? renderQuestion(currentQuestion, state.currentQuestionIndex)
              : defaultRenderQuestion()}

            {children}
          </div>
        )}
      </div>
    </QuizProvider>
  );
}