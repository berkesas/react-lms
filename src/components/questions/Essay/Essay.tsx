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
    <div className="essay-question">
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

      <div className="essay-input-container">
        <textarea
          className={`essay-textarea ${validation.errors.length > 0 ? 'essay-textarea-error' : ''}`}
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
        
        <div className="essay-counters">
          {showWordCount && (
            <div className={`essay-word-count ${isUnderMinWords || isOverMaxWords ? 'count-warning' : ''}`}>
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
            <div className={`essay-char-count ${isUnderMinChars || isOverMaxChars ? 'count-warning' : ''}`}>
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
          <div className="essay-length-warnings" role="alert">
            {isUnderMinWords && (
              <p className="warning-message">Your essay needs at least {config.minWords! - wordCount} more words.</p>
            )}
            {isOverMaxWords && (
              <p className="warning-message">Your essay exceeds the maximum by {wordCount - config.maxWords!} words.</p>
            )}
            {isUnderMinChars && (
              <p className="warning-message">Your essay needs at least {config.minCharacters! - charCount} more characters.</p>
            )}
            {isOverMaxChars && (
              <p className="warning-message">Your essay exceeds the maximum by {charCount - config.maxCharacters!} characters.</p>
            )}
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

export function Essay(props: EssayProps) {
  const { config, ...baseProps } = props;

  return (
    <BaseQuestion<EssayAnswer> config={config} {...baseProps}>
      <EssayContent />
    </BaseQuestion>
  );
}