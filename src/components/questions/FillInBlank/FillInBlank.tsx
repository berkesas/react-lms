import { useCallback } from 'react';
import { BaseQuestion, BaseQuestionProps } from '../BaseQuestion';
import { useQuestionContext } from '../../../context/QuestionContext';
import type { FillInBlankConfig, FillInBlankAnswer } from '../../../types';

export interface FillInBlankProps extends Omit<BaseQuestionProps<FillInBlankAnswer>, 'config'> {
  config: FillInBlankConfig;
}

function FillInBlankContent() {
  const context = useQuestionContext<FillInBlankAnswer>();
  const { config, answer, setAnswer, isLocked, validation } = context;
  
  if (config.type !== 'fill-in-blank') {
    throw new Error('FillInBlank component requires a fill-in-blank config');
  }

  const answers = answer.value || {};

  const handleBlankChange = useCallback((blankId: string, value: string) => {
    if (isLocked) return;
    
    const newAnswers = {
      ...answers,
      [blankId]: value,
    };
    
    setAnswer(newAnswers);
  }, [isLocked, answers, setAnswer]);

  const renderSegment = (segment: typeof config.segments[number], index: number) => {
    if (segment.type === 'text') {
      return (
        <span key={index} className="fib-text">
          {segment.content}
        </span>
      );
    }

    // Blank segment
    const blankId = segment.id!;
    const value = answers[blankId] || '';

    return (
      <input
        key={index}
        type="text"
        className="fib-blank"
        value={value}
        onChange={(e) => handleBlankChange(blankId, e.target.value)}
        disabled={isLocked}
        placeholder={segment.placeholder || '___'}
        aria-label={`Blank ${index + 1}`}
        size={Math.max(10, value.length + 2)}
      />
    );
  };

  return (
    <div className="fill-in-blank-question">
      <div className="question-header">
        {config.title && <h3 className="question-title">{config.title}</h3>}
        {config.instructions && (
          <p className="question-instructions">{config.instructions}</p>
        )}
      </div>

      {config.media && config.media.length > 0 && (
        <div className="question-media">
          {config.media.map(media => (
            <div key={media.id} className="media-item">
              {media.type === 'image' && (
                <img src={media.url} alt={media.alt || ''} />
              )}
              {media.caption && <p className="media-caption">{media.caption}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="fib-content">
        {config.segments.map((segment, index) => renderSegment(segment, index))}
      </div>

      {validation.errors.length > 0 && (
        <div className="question-errors" role="alert">
          {validation.errors.map((error, index) => (
            <p key={index} className="error-message">{error}</p>
          ))}
        </div>
      )}

      {context.feedback && context.showFeedback && (
        <div className={`question-feedback feedback-${context.feedback.type}`} role="status">
          {context.feedback.message}
        </div>
      )}

      {config.feedback?.hints && config.feedback.hints.length > 0 && !isLocked && (
        <div className="question-hints">
          <details>
            <summary>Show Hint</summary>
            {config.feedback.hints.map((hint, index) => (
              <p key={index} className="hint-text">{hint}</p>
            ))}
          </details>
        </div>
      )}

      <div className="question-meta">
        <span className="question-points">{config.points} points</span>
        {config.difficulty && (
          <span className="question-difficulty">{config.difficulty}</span>
        )}
      </div>
    </div>
  );
}

export function FillInBlank(props: FillInBlankProps) {
  const { config, ...baseProps } = props;

  return (
    <BaseQuestion<FillInBlankAnswer> config={config} {...baseProps}>
      <FillInBlankContent />
    </BaseQuestion>
  );
}