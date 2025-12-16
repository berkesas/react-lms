import React from 'react';
import { useQuizContext } from '../../../context/QuizContext';

export interface QuizNavigationProps {
  showQuestionList?: boolean;
  className?: string;
}

export function QuizNavigation(props: QuizNavigationProps) {
  const { showQuestionList = false, className } = props;
  const {
    state,
    goToQuestion,
    nextQuestion,
    previousQuestion,
    canGoNext,
    canGoPrevious,
    submitQuiz,
    canSubmitQuiz,
  } = useQuizContext();

  const { config, currentQuestionIndex } = state;

  return (
    <div className={`quiz-navigation ${className || ''}`}>
      {showQuestionList && config.allowNavigation && (
        <div className="quiz-question-list">
          <h3>Questions</h3>
          <div className="quiz-question-grid">
            {config.questions.map((question, index) => {
              const isAnswered = state.answers.has(question.id);
              const isCurrent = index === currentQuestionIndex;
              
              return (
                <button
                  key={question.id}
                  type="button"
                  className={`quiz-question-item ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''}`}
                  onClick={() => goToQuestion(index)}
                  aria-label={`Go to question ${index + 1}`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {index + 1}
                  {isAnswered && <span className="answered-indicator">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="quiz-nav-buttons">
        <button
          type="button"
          className="quiz-nav-button quiz-prev-button"
          onClick={previousQuestion}
          disabled={!canGoPrevious}
          aria-label="Previous question"
        >
          ← Previous
        </button>

        <span className="quiz-nav-position">
          {currentQuestionIndex + 1} / {config.questions.length}
        </span>

        {canGoNext ? (
          <button
            type="button"
            className="quiz-nav-button quiz-next-button"
            onClick={nextQuestion}
            aria-label="Next question"
          >
            Next →
          </button>
        ) : (
          <button
            type="button"
            className="quiz-nav-button quiz-submit-button"
            onClick={submitQuiz}
            disabled={!canSubmitQuiz}
            aria-label="Submit quiz"
          >
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
}