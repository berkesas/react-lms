import React, { ReactNode } from 'react';
import { useQuizState } from '../../../hooks/quiz/useQuizState';
import { QuizProvider } from '../../../context/QuizContext';
import type { QuizConfig, QuizResult } from '../../../types/quiz';
import type { QuestionAnswer, QuestionSubmission } from '../../../types';

export interface QuizProps {
  config: QuizConfig;
  children?: ReactNode;
  onAnswerChange?: (questionId: string, answer: QuestionAnswer) => void;
  onQuestionSubmit?: (submission: QuestionSubmission) => void;
  onQuizSubmit?: (result: QuizResult) => void;
  onProgressChange?: (progress: any) => void;
  renderQuestion?: (question: any, index: number) => ReactNode;
  renderNavigation?: () => ReactNode;
  renderProgress?: () => ReactNode;
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
    renderNavigation,
    renderProgress,
    className,
  } = props;

  const quizState = useQuizState({
    config,
    onAnswerChange,
    onQuestionSubmit,
    onQuizSubmit,
    onProgressChange,
  });

  const {
    state,
    progress,
    currentQuestion,
    nextQuestion,
    previousQuestion,
    canGoNext,
    canGoPrevious,
    submitQuiz,
    canSubmitQuiz,
  } = quizState;

  // Default question renderer
  const defaultRenderQuestion = () => {
    if (!currentQuestion) return null;
    
    return (
      <div className="quiz-question-container">
        <div className="quiz-question-number">
          Question {state.currentQuestionIndex + 1} of {config.questions.length}
        </div>
        {/* Question component will be rendered by children or custom renderer */}
      </div>
    );
  };

  // Default navigation renderer
  const defaultRenderNavigation = () => (
    <div className="quiz-navigation">
      <button
        type="button"
        className="quiz-nav-button quiz-nav-prev"
        onClick={previousQuestion}
        disabled={!canGoPrevious}
      >
        ← Previous
      </button>
      
      {canGoNext ? (
        <button
          type="button"
          className="quiz-nav-button quiz-nav-next"
          onClick={nextQuestion}
        >
          Next →
        </button>
      ) : (
        <button
          type="button"
          className="quiz-nav-button quiz-nav-submit"
          onClick={submitQuiz}
          disabled={!canSubmitQuiz}
        >
          Submit Quiz
        </button>
      )}
    </div>
  );

  // Default progress renderer
  const defaultRenderProgress = () => (
    <div className="quiz-progress">
      <div className="quiz-progress-bar">
        <div 
          className="quiz-progress-fill"
          style={{ width: `${progress.percentComplete}%` }}
          role="progressbar"
          aria-valuenow={progress.percentComplete}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <div className="quiz-progress-text">
        {progress.answeredQuestions} of {progress.totalQuestions} answered
      </div>
      {config.timeLimit && (
        <div className="quiz-time-remaining">
          Time remaining: {Math.floor((progress.timeRemaining || 0) / 60)}:
          {String((progress.timeRemaining || 0) % 60).padStart(2, '0')}
        </div>
      )}
    </div>
  );

  return (
    <QuizProvider value={quizState}>
      <div className={`quiz-container ${className || ''}`}>
        <div className="quiz-header">
          <h1 className="quiz-title">{config.title}</h1>
          {config.description && (
            <p className="quiz-description">{config.description}</p>
          )}
          {config.instructions && (
            <div className="quiz-instructions">{config.instructions}</div>
          )}
        </div>

        {renderProgress ? renderProgress() : defaultRenderProgress()}

        <div className="quiz-content">
          {renderQuestion
            ? renderQuestion(currentQuestion, state.currentQuestionIndex)
            : defaultRenderQuestion()}
          
          {children}
        </div>

        {config.allowNavigation && (
          renderNavigation ? renderNavigation() : defaultRenderNavigation()
        )}

        {state.status === 'submitted' && (
          <div className="quiz-submitted-message" role="status">
            <h2>Quiz Submitted!</h2>
            <p>Your responses have been recorded.</p>
          </div>
        )}
      </div>
    </QuizProvider>
  );
}