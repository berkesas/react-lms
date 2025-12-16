import { useQuizContext } from '../../../context/QuizContext';
import type { QuestionConfig } from '../../../types';

export interface QuizResultsProps {
  onRetake?: () => void;
  onClose?: () => void;
  className?: string;
}

export function QuizResults(props: QuizResultsProps) {
  const { onRetake, onClose, className } = props;
  const { state, loadedResult, hideResults } = useQuizContext();

  if (!loadedResult) {
    return (
      <div className="quiz-results-error">
        No results to display
      </div>
    );
  }

  const { score, maxScore, percentage, isPassed, submittedAt, attemptNumber } = loadedResult;
  const config = state.config;  // Get config from state

  return (
    <div className={`quiz-results ${className || ''}`}>
      <div className="quiz-results-header">
        <h2>Quiz Results</h2>
        <p className="quiz-results-date">
          Submitted: {new Date(submittedAt).toLocaleString()}
        </p>
      </div>

      <div className="quiz-results-summary">
        <div className="results-score-card">
          <div className="score-main">
            <span className="score-value">{score}</span>
            <span className="score-divider">/</span>
            <span className="score-max">{maxScore}</span>
          </div>
          <div className="score-percentage">
            {percentage.toFixed(1)}%
          </div>
          <div className={`score-status ${isPassed ? 'passed' : 'failed'}`}>
            {isPassed ? '✓ Passed' : '✗ Did Not Pass'}
          </div>
        </div>

        <div className="results-metadata">
          <div className="metadata-item">
            <span className="metadata-label">Attempt:</span>
            <span className="metadata-value">{attemptNumber}</span>
          </div>
          {config.passingScore && (
            <div className="metadata-item">
              <span className="metadata-label">Passing Score:</span>
              <span className="metadata-value">{config.passingScore}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="quiz-results-questions">
        <h3>Question Results</h3>
        {config.questions.map((question, index) => {
          const answer = state.answers.get(question.id);
          const graded = loadedResult.gradedAnswers?.get(question.id);

          return (
            <div 
              key={question.id} 
              className={`result-question ${graded?.isCorrect ? 'correct' : 'incorrect'}`}
            >
              <div className="result-question-header">
                <span className="result-question-number">Question {index + 1}</span>
                <span className={`result-question-status ${graded?.isCorrect ? 'status-correct' : 'status-incorrect'}`}>
                  {graded?.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </span>
                <span className="result-question-score">
                  {graded?.score || 0} / {question.points} points
                </span>
              </div>

              <div 
                className="result-question-text"
                dangerouslySetInnerHTML={{ __html: question.question }}
              />

              <div className="result-answer">
                <strong>Your answer:</strong>
                <div className="result-answer-value">
                  {formatAnswer(answer?.value, question.type)}
                </div>
              </div>

              {graded?.feedback && (
                <div className="result-feedback">
                  {graded.feedback}
                </div>
              )}

              {config.showCorrectAnswers && !graded?.isCorrect && (
                <div className="result-correct-answer">
                  <strong>Correct answer:</strong>
                  <div className="result-correct-value">
                    {getCorrectAnswer(question)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="quiz-results-actions">
        {onClose && (
          <button 
            type="button"
            className="results-action-button results-close-button"
            onClick={() => {
              hideResults();
              onClose();
            }}
          >
            Close
          </button>
        )}
        {onRetake && (
          <button 
            type="button"
            className="results-action-button results-retake-button"
            onClick={onRetake}
          >
            Retake Quiz
          </button>
        )}
      </div>
    </div>
  );
}

// Helper function to format answers for display
function formatAnswer(value: any, questionType: string): string {
  if (value === undefined || value === null) {
    return 'No answer provided';
  }

  switch (questionType) {
    case 'multiple-choice':
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return String(value);
    
    case 'true-false':
      return value ? 'True' : 'False';
    
    case 'short-answer':
    case 'essay':
      return String(value);
    
    case 'fill-in-blank':
      return JSON.stringify(value, null, 2);
    
    case 'matching':
      return JSON.stringify(value, null, 2);
    
    default:
      return String(value);
  }
}

// Helper function to get correct answer display
function getCorrectAnswer(question: QuestionConfig): string {
  switch (question.type) {
    case 'multiple-choice':
      const correctOptions = question.options
        .filter(opt => opt.isCorrect)
        .map(opt => opt.text);
      return correctOptions.join(', ');
    
    case 'true-false':
      return question.correctAnswer ? 'True' : 'False';
    
    case 'short-answer':
      return question.correctAnswers?.join(' or ') || 'Multiple answers accepted';
    
    default:
      return 'See instructor for correct answer';
  }
}