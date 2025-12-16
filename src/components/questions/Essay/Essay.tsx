import { useCallback, ChangeEvent, useState, useEffect } from 'react';
import { BaseQuestion, BaseQuestionProps } from '../BaseQuestion';
import { useQuestionContext } from '../../../context/QuestionContext';
import type { EssayConfig, EssayAnswer } from '../../../types';

export interface EssayProps extends Omit<BaseQuestionProps<EssayAnswer>, 'config'> {
  config: EssayConfig;
}

function EssayContent() {
  const context = useQuestionContext<EssayAnswer>();
  const { config, answer, setAnswer, isLocked, validation } = context;
  
  if (config.type !== 'essay') {
    throw new Error('Essay component requires an essay config');
  }

  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // Calculate word and character count
  useEffect(() => {
    const text = answer.value || '';
    setCharCount(text.length);
    
    // Count words (split by whitespace and filter empty strings)
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [answer.value]);

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    if (isLocked) return;
    
    const value = e.target.value;
    
    // Check character limit
    if (config.maxCharacters && value.length > config.maxCharacters) {
      return;
    }
    
    setAnswer(value);
  }, [isLocked, setAnswer, config.maxCharacters]);

  const handleBlur = useCallback(() => {
    if (config.validation?.validateOnBlur) {
      context.validate();
    }
  }, [config.validation, context]);

  const showWordCount = config.minWords || config.maxWords;
  const showCharCount = config.minCharacters || config.maxCharacters;

  const isUnderMinWords = config.minWords && wordCount < config.minWords;
  const isOverMaxWords = config.maxWords && wordCount > config.maxWords;
  const isUnderMinChars = config.minCharacters && charCount < config.minCharacters;
  const isOverMaxChars = config.maxCharacters && charCount > config.maxCharacters;

  return (
    <div className="picolms-essay-question">
      <div className="picolms-question-header">
        {config.title && <h3 className="picolms-question-title">{config.title}</h3>}
        <div 
          className="picolms-question-text"
          dangerouslySetInnerHTML={{ __html: config.question }}
        />
        {config.instructions && (
          <p className="picolms-question-instructions">{config.instructions}</p>
        )}
      </div>

      {config.media && config.media.length > 0 && (
        <div className="picolms-question-media">
          {config.media.map(media => (
            <div key={media.id} className="picolms-media-item">
              {media.type === 'image' && (
                <img src={media.url} alt={media.alt || ''} />
              )}
              {media.caption && <p className="picolms-media-caption">{media.caption}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="picolms-essay-input-container">
        <textarea
          className={`picolms-essay-textarea ${validation.errors.length > 0 ? 'essay-textarea-error' : ''}`}
          value={answer.value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isLocked}
          placeholder={config.placeholder || 'Type your answer here...'}
          rows={10}
          aria-label={config.accessibility?.ariaLabel || 'Your essay answer'}
          aria-invalid={validation.errors.length > 0}
          aria-describedby={validation.errors.length > 0 ? `error-${config.id}` : undefined}
        />
        
        <div className="picolms-essay-counters">
          {showWordCount && (
            <div className={`picolms-essay-word-count ${isUnderMinWords || isOverMaxWords ? 'count-warning' : ''}`}>
              <span className="count-label">Words:</span>
              <span className="count-value">
                {wordCount}
                {config.minWords && config.maxWords && ` (${config.minWords}-${config.maxWords})`}
                {config.minWords && !config.maxWords && ` (min: ${config.minWords})`}
                {!config.minWords && config.maxWords && ` (max: ${config.maxWords})`}
              </span>
            </div>
          )}
          
          {showCharCount && (
            <div className={`picolms-essay-char-count ${isUnderMinChars || isOverMaxChars ? 'count-warning' : ''}`}>
              <span className="count-label">Characters:</span>
              <span className="count-value">
                {charCount}
                {config.minCharacters && config.maxCharacters && ` (${config.minCharacters}-${config.maxCharacters})`}
                {config.minCharacters && !config.maxCharacters && ` (min: ${config.minCharacters})`}
                {!config.minCharacters && config.maxCharacters && ` (max: ${config.maxCharacters})`}
              </span>
            </div>
          )}
        </div>

        {(isUnderMinWords || isOverMaxWords || isUnderMinChars || isOverMaxChars) && (
          <div className="picolms-essay-length-warnings" role="alert">
            {isUnderMinWords && (
              <p className="picolms-warning-message">Your essay needs at least {config.minWords! - wordCount} more words.</p>
            )}
            {isOverMaxWords && (
              <p className="picolms-warning-message">Your essay exceeds the maximum by {wordCount - config.maxWords!} words.</p>
            )}
            {isUnderMinChars && (
              <p className="picolms-warning-message">Your essay needs at least {config.minCharacters! - charCount} more characters.</p>
            )}
            {isOverMaxChars && (
              <p className="picolms-warning-message">Your essay exceeds the maximum by {charCount - config.maxCharacters!} characters.</p>
            )}
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
              <p key={index} className="picolms-hint-text">{hint}</p>
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

export function Essay(props: EssayProps) {
  const { config, ...baseProps } = props;

  return (
    <BaseQuestion<EssayAnswer> config={config} {...baseProps}>
      <EssayContent />
    </BaseQuestion>
  );
}