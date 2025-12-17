import { ReactNode } from 'react';
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

  const quizState = useQuizState({
    config,
    onAnswerChange,
    onQuestionSubmit,
    onQuizSubmit,
    onProgressChange,
    loadedResult,
    storageManager,
    autoSaveInterval,
  });

  const { state, currentQuestion, showingResults } = quizState;

  // Default question renderer
  const defaultRenderQuestion = () => {
    if (!currentQuestion) return null;

    return (
      <div className="picolms-quiz-question-container">
        <div className="picolms-quiz-question-number">
          Question {state.currentQuestionIndex + 1} of {config.questions.length}
        </div>
        {/* Question component will be rendered by children or custom renderer */}
      </div>
    );
  };

  // Default progress renderer
  if (showingResults && loadedResult) {
    return (
      <QuizProvider value={quizState}>
        <div className={`picolms-quiz-container ${className || ''}`}>
          <div className="picolms-quiz-header">
            <h1 className="picolms-quiz-title">{config.title}</h1>
            {config.description && (
              <p className="picolms-quiz-description">{config.description}</p>
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
          <h1 className="picolms-quiz-title">{config.title}</h1>
          {config.description && (
            <p className="picolms-quiz-description">{config.description}</p>
          )}
          {config.instructions && (
            <div className="picolms-quiz-instructions">
              {config.instructions}
            </div>
          )}
        </div>

        {/* SHOW RESULTS IF SUBMITTED/GRADED */}
        {(state.status === 'submitted' || state.status === 'graded') &&
        config.showScore ? (
          <div
            className="picolms-quiz-results-summary"
            style={{
              padding: '2rem',
              background: '#f3f4f6',
              borderRadius: '1rem',
              textAlign: 'center',
              marginBottom: '2rem',
            }}
          >
            <h2>Quiz Complete!</h2>
            <div
              style={{ fontSize: '3rem', fontWeight: 'bold', margin: '1rem 0' }}
            >
              {state.score} / {state.maxScore}
            </div>
            <div style={{ fontSize: '1.5rem', color: '#6b7280' }}>
              {(((state.score || 0) / state.maxScore) * 100).toFixed(1)}%
            </div>
            {config.passingScore && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  background:
                    ((state.score || 0) / state.maxScore) * 100 >=
                    config.passingScore
                      ? '#d1fae5'
                      : '#fee2e2',
                  color:
                    ((state.score || 0) / state.maxScore) * 100 >=
                    config.passingScore
                      ? '#10b981'
                      : '#ef4444',
                  fontWeight: 'bold',
                }}
              >
                {((state.score || 0) / state.maxScore) * 100 >=
                config.passingScore
                  ? '✓ Passed'
                  : '✗ Did Not Pass'}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="picolms-quiz-content">
              {renderQuestion
                ? renderQuestion(currentQuestion, state.currentQuestionIndex)
                : defaultRenderQuestion()}

              {children}
            </div>
          </>
        )}
      </div>
    </QuizProvider>
  );
}
