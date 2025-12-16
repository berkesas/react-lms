import { useQuizContext } from '../../../context/QuizContext';

export interface QuizProgressBarProps {
  showTimeRemaining?: boolean;
  showAnsweredCount?: boolean;
  showProgressBar?: boolean;
  className?: string;
}

export function QuizProgressBar(props: QuizProgressBarProps) {
  const {
    showTimeRemaining = true,
    showAnsweredCount = true,
    showProgressBar = true,
    className,
  } = props;

  const { state, progress } = useQuizContext();
  const { config } = state;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className={`picolms-quiz-progress ${className || ''}`}>
      {showProgressBar && (
        <div className="picolms-quiz-progress-bar-container">
          <div
            className="picolms-quiz-progress-bar"
            role="progressbar"
            aria-valuenow={progress.percentComplete}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Quiz progress"
          >
            <div
              className="picolms-quiz-progress-fill"
              style={{ width: `${progress.percentComplete}%` }}
            />
          </div>
          <span className="picolms-quiz-progress-percentage">
            {Math.round(progress.percentComplete)}%
          </span>
        </div>
      )}

      <div className="picolms-quiz-progress-info">
        {showAnsweredCount && (
          <div className="picolms-quiz-progress-answered">
            <span className="picolms-progress-label">Answered:</span>
            <span className="picolms-progress-value">
              {progress.answeredQuestions} / {progress.totalQuestions}
            </span>
          </div>
        )}

        {showTimeRemaining && config.timeLimit && progress.timeRemaining !== undefined && (
          <div className={`picolms-quiz-progress-time ${progress.timeRemaining < 60 ? 'time-warning' : ''}`}>
            <span className="picolms-progress-label">Time remaining:</span>
            <span className="picolms-progress-value">
              {formatTime(progress.timeRemaining)}
            </span>
          </div>
        )}

        <div className="picolms-quiz-progress-time-spent">
          <span className="picolms-progress-label">Time spent:</span>
          <span className="picolms-progress-value">
            {formatTime(progress.timeSpent)}
          </span>
        </div>
      </div>
    </div>
  );
}