import { useQuizContext } from '../../../context/QuizContext';

export interface QuizReviewProps {
  onEdit?: (questionIndex: number) => void;
  onSubmit?: () => void;
  className?: string;
}

export function QuizReview(props: QuizReviewProps) {
  const { onEdit, onSubmit, className } = props;
  const { state, goToQuestion, submitQuiz, exitReviewMode } = useQuizContext();
  const { config } = state;

  const handleEdit = (index: number) => {
    exitReviewMode();
    goToQuestion(index);
    if (onEdit) {
      onEdit(index);
    }
  };

  const handleSubmit = () => {
    submitQuiz();
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className={`picolms-quiz-review ${className || ''}`}>
      <div className="picolms-quiz-review-header">
        <h2>Review Your Answers</h2>
        <p>Please review your answers before submitting the quiz.</p>
      </div>

      <div className="picolms-quiz-review-summary">
        <div className="picolms-review-summary-item">
          <span className="picolms-summary-label">Total Questions:</span>
          <span className="picolms-summary-value">{config.questions.length}</span>
        </div>
        <div className="picolms-review-summary-item">
          <span className="picolms-summary-label">Answered:</span>
          <span className="picolms-summary-value">
            {Array.from(state.answers.values()).filter(a => a.isAnswered).length}
          </span>
        </div>
        <div className="picolms-review-summary-item">
          <span className="picolms-summary-label">Unanswered:</span>
          <span className="picolms-summary-value">
            {config.questions.length - Array.from(state.answers.values()).filter(a => a.isAnswered).length}
          </span>
        </div>
      </div>

      <div className="picolms-quiz-review-questions">
        {config.questions.map((question, index) => {
          const answer = state.answers.get(question.id);
          const isAnswered = answer?.isAnswered || false;

          return (
            <div
              key={question.id}
              className={`picolms-quiz-review-question ${isAnswered ? 'answered' : 'unanswered'}`}
            >
              <div className="picolms-review-question-header">
                <span className="picolms-review-question-number">Question {index + 1}</span>
                <span className={`picolms-review-question-status ${isAnswered ? 'status-answered' : 'status-unanswered'}`}>
                  {isAnswered ? '✓ Answered' : '⚠ Not Answered'}
                </span>
              </div>
              
              <div 
                className="picolms-review-question-text"
                dangerouslySetInnerHTML={{ __html: question.question }}
              />

              {isAnswered && answer && (
                <div className="picolms-review-question-answer">
                  <strong>Your answer:</strong>
                  <div className="picolms-review-answer-value">
                    {typeof answer.value === 'string' 
                      ? answer.value 
                      : Array.isArray(answer.value)
                      ? answer.value.join(', ')
                      : JSON.stringify(answer.value)}
                  </div>
                </div>
              )}

              <button
                type="button"
                className="picolms-review-edit-button"
                onClick={() => handleEdit(index)}
              >
                {isAnswered ? 'Edit Answer' : 'Answer Question'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="picolms-quiz-review-actions">
        <button
          type="button"
          className="picolms-review-back-button"
          onClick={exitReviewMode}
        >
          Back to Quiz
        </button>
        <button
          type="button"
          className="picolms-review-submit-button"
          onClick={handleSubmit}
        >
          Submit Quiz
        </button>
      </div>
    </div>
  );
}