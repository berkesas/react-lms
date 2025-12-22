import { useQuizContext } from '../../../context/QuizContext';
import type { QuestionConfig } from '../../../types';
import { MultipleChoiceAnswer } from '../../../types';

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
      <div className="picolms-quiz-results-error">No results to display</div>
    );
  }

  const { score, maxScore, percentage, isPassed, submittedAt, attemptNumber } =
    loadedResult;
  const config = state.config; // Get config from state

  return (
    <div className={`picolms-quiz-results ${className || ''}`}>
      <div className="picolms-quiz-results-header">
        <h2>Quiz Results</h2>
        <p className="picolms-quiz-results-date">
          Submitted: {new Date(submittedAt).toLocaleString()}
        </p>
      </div>

      <div className="picolms-quiz-results-summary">
        <div className="picolms-results-score-card">
          <div className="picolms-score-main">
            <span className="picolms-score-value">{score}</span>
            <span className="picolms-score-divider">/</span>
            <span className="picolms-score-max">{maxScore}</span>
          </div>
          <div className="picolms-score-percentage">
            {percentage.toFixed(1)}%
          </div>
          <div
            className={`picolms-score-status ${isPassed ? 'passed' : 'failed'}`}
          >
            {isPassed ? '✓ Passed' : '✗ Did Not Pass'}
          </div>
        </div>

        <div className="picolms-results-metadata">
          <div className="picolms-metadata-item">
            <span className="picolms-metadata-label">Attempt:</span>
            <span className="picolms-metadata-value">{attemptNumber}</span>
          </div>
          {config.passingScore && (
            <div className="picolms-metadata-item">
              <span className="picolms-metadata-label">Passing Score:</span>
              <span className="picolms-metadata-value">
                {config.passingScore}%
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="picolms-quiz-results-questions">
        <h3>Question Results</h3>
        {config.questions.map((question, index) => {
          const answer = state.answers.get(question.id);
          const graded = loadedResult.gradedAnswers?.get(question.id);

          return (
            <div
              key={question.id}
              className={`picolms-result-question ${graded?.isCorrect ? 'correct' : 'incorrect'}`}
            >
              <div className="picolms-result-question-header">
                <span className="picolms-result-question-number">
                  Question {index + 1}
                </span>
                <span
                  className={`picolms-result-question-status ${graded?.isCorrect ? 'status-correct' : 'status-incorrect'}`}
                >
                  {graded?.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </span>
                <span className="picolms-result-question-score">
                  {graded?.score || 0} / {question.points} points
                </span>
              </div>

              <div
                className="picolms-result-question-text"
                dangerouslySetInnerHTML={{ __html: question.question }}
              />

              <div className="picolms-result-answer">
                <strong>Your answer:</strong>
                <div className="picolms-result-answer-value">
                  {formatAnswer(answer?.value, question)}
                </div>
              </div>

              {graded?.feedback && (
                <div className="picolms-result-feedback">{graded.feedback}</div>
              )}

              {config.showCorrectAnswers && !graded?.isCorrect && (
                <div className="picolms-result-correct-answer">
                  <strong>Correct answer:</strong>
                  <div className="picolms-result-correct-value">
                    {getCorrectAnswer(question)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="picolms-quiz-results-actions">
        {onClose && (
          <button
            type="button"
            className="picolms-results-action-button picolms-results-close-button"
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
            className="picolms-results-action-button picolms-results-retake-button"
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
function formatAnswer(
  value: MultipleChoiceAnswer | any,
  question: QuestionConfig
): string {
  if (value === undefined || value === null) {
    return 'No answer provided';
  }

  switch (question.type) {
    case 'multiple-choice':
      // console.log('Formatting multiple-choice answer:', value, question);
      if (
        !question ||
        question.type !== 'multiple-choice' ||
        !Array.isArray(question.options)
      ) {
        return String(value);
      }

      const mapIdToText = (id: string) => {
        const opt = question.options.find((o) => o.id === id);
        // console.log('Mapping option ID to text:', id, opt);
        return opt ? opt.text : id;
      };

      if (Array.isArray(value)) {
        return value.map(mapIdToText).join(', ');
      }

      return mapIdToText(value as string);

    case 'true-false':
      return Boolean(value) ? 'True' : 'False';

    case 'short-answer':
    case 'essay':
      return String(value);

    case 'fill-in-blank':
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
        .filter((opt) => opt.isCorrect)
        .map((opt) => opt.text);
      return correctOptions.join(', ');

    case 'true-false':
      return question.correctAnswer ? 'True' : 'False';

    case 'short-answer':
      return (
        question.correctAnswers?.join(' or ') || 'Multiple answers accepted'
      );

    default:
      return 'See instructor for correct answer';
  }
}
