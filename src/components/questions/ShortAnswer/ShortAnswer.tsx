import { useCallback, ChangeEvent } from 'react';
import { BaseQuestion, BaseQuestionProps } from '../BaseQuestion';
import { useQuestionContext } from '../../../context/QuestionContext';
import type { ShortAnswerConfig, ShortAnswerAnswer } from '../../../types';

export interface ShortAnswerProps extends Omit<BaseQuestionProps<ShortAnswerAnswer>, 'config'> {
  config: ShortAnswerConfig;
}

function ShortAnswerContent() {
  const context = useQuestionContext<ShortAnswerAnswer>();
  const { config, answer, setAnswer, isLocked, validation } = context;
  
  if (config.type !== 'short-answer') {
    throw new Error('ShortAnswer component requires a short-answer config');
  }

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;
    
    let value = e.target.value;
    
    // Apply trimming if configured
    if (config.trimWhitespace) {
      value = value.trim();
    }
    
    setAnswer(value);
  }, [isLocked, setAnswer, config.trimWhitespace]);

  const handleBlur = useCallback(() => {
    if (config.validation?.validateOnBlur) {
      context.validate();
    }
  }, [config.validation, context]);

  const characterCount = answer.value?.length || 0;
  const showCharacterCount = config.maxLength || config.minLength;

  return (
    <div className="short-answer-question">
      <div className="question-header">
        {config.title && <h3 className="question-title">{config.title}</h3>}
        <div 
          className="question-text"
          dangerouslySetInnerHTML={{ __html: config.question }}
        />
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

      <div className="sa-input-container">
        <input
          type="text"
          className={`sa-input ${validation.errors.length > 0 ? 'sa-input-error' : ''}`}
          value={answer.value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isLocked}
          placeholder={config.placeholder}
          maxLength={config.maxLength}
          pattern={config.pattern}
          aria-label={config.accessibility?.ariaLabel || 'Your answer'}
          aria-invalid={validation.errors.length > 0}
          aria-describedby={validation.errors.length > 0 ? `error-${config.id}` : undefined}
        />
        
        {showCharacterCount && (
          <div className="sa-character-count">
            {characterCount}
            {config.maxLength && ` / ${config.maxLength}`}
            {config.minLength && !config.maxLength && ` (min: ${config.minLength})`}
          </div>
        )}
      </div>

      {validation.errors.length > 0 && (
        <div id={`error-${config.id}`} className="question-errors" role="alert">
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

export function ShortAnswer(props: ShortAnswerProps) {
  const { config, ...baseProps } = props;

  return (
    <BaseQuestion<ShortAnswerAnswer> config={config} {...baseProps}>
      <ShortAnswerContent />
    </BaseQuestion>
  );
}