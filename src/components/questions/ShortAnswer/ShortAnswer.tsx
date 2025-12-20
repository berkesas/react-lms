import { useCallback, ChangeEvent } from 'react';
import { BaseQuestion, BaseQuestionProps } from '../BaseQuestion';
import { useQuestionContext } from '../../../context/QuestionContext';
import type { ShortAnswerConfig, ShortAnswerAnswer, ContentRenderer } from '../../../types';

export interface ShortAnswerProps extends Omit<BaseQuestionProps<ShortAnswerAnswer>, 'config'> {
  config: ShortAnswerConfig;
  renderContent?: ContentRenderer;
}

/**
 * Default content renderer - renders plain text safely
 * Users can override with custom renderer for Markdown/HTML support
 */
const defaultContentRenderer: ContentRenderer = (content) => {
  return <span>{content}</span>;
};

function ShortAnswerContent() {
  const context = useQuestionContext<ShortAnswerAnswer>();
  const { config, answer, setAnswer, isLocked, validation, renderContent } = context;

  // Use renderContent from context, fallback to default safe renderer
  const contentRenderer = renderContent || defaultContentRenderer;
  
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
    <div className="picolms-short-answer-question">
      <div className="picolms-question-header">
        {config.title && (
          <h3 className="picolms-question-title">{config.title}</h3>
        )}
        {/* ✅ Use custom renderer for question text */}
        <div className="picolms-question-text">
          {contentRenderer(config.question, {
            type: 'question',
            questionId: config.id
          })}
        </div>
        {config.instructions && (
          <p className="picolms-question-instructions">
            {/* ✅ Use custom renderer for instructions */}
            {contentRenderer(config.instructions, {
              type: 'instruction',
              questionId: config.id
            })}
          </p>
        )}
      </div>

      {config.media && config.media.length > 0 && (
        <div className="picolms-question-media">
          {config.media.map((media) => (
            <div key={media.id} className="picolms-media-item">
              {media.type === 'image' && (
                <img src={media.url} alt={media.alt || ''} />
              )}
              {media.caption && (
                <p className="picolms-media-caption">{media.caption}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="picolms-sa-input-container">
        <input
          type="text"
          className={`picolms-sa-input ${validation.errors.length > 0 ? 'sa-input-error' : ''}`}
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
          <div className="picolms-sa-character-count">
            {characterCount}
            {config.maxLength && ` / ${config.maxLength}`}
            {config.minLength && !config.maxLength && ` (min: ${config.minLength})`}
          </div>
        )}
      </div>

      {validation.errors.length > 0 && (
        <div id={`error-${config.id}`} className="picolms-question-errors" role="alert">
          {validation.errors.map((error, index) => (
            <p key={index} className="picolms-error-message">{error}</p>
          ))}
        </div>
      )}

      {context.feedback && context.showFeedback && (
        <div className={`picolms-question-feedback feedback-${context.feedback.type}`} role="status">
          {context.feedback.message}
        </div>
      )}

      {config.feedback?.hints && config.feedback.hints.length > 0 && !isLocked && (
        <div className="picolms-question-hints">
          <details>
            <summary>Show Hint</summary>
            {config.feedback.hints.map((hint, index) => (
              <p key={index} className="picolms-hint-text">
                {/* ✅ Use custom renderer for hints */}
                {contentRenderer(hint, {
                  type: 'hint',
                  questionId: config.id
                })}
              </p>
            ))}
          </details>
        </div>
      )}

      <div className="picolms-question-meta">
        <span className="picolms-question-points">{config.points} points</span>
        {config.difficulty && (
          <span className="picolms-question-difficulty">{config.difficulty}</span>
        )}
      </div>
    </div>
  );
}

export function ShortAnswer(props: ShortAnswerProps) {
  const { config, renderContent, ...baseProps } = props;

  return (
    <BaseQuestion<ShortAnswerAnswer> 
      config={config}
      renderContent={renderContent}
      {...baseProps}
    >
      <ShortAnswerContent />
    </BaseQuestion>
  );
}