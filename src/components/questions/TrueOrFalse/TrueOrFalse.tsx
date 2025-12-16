import { useCallback } from 'react';
import { BaseQuestion, BaseQuestionProps } from '../BaseQuestion';
import { useQuestionContext } from '../../../context/QuestionContext';
import type { TrueFalseConfig, TrueFalseAnswer } from '../../../types';

export interface TrueOrFalseProps extends Omit<BaseQuestionProps<TrueFalseAnswer>, 'config'> {
  config: TrueFalseConfig;
}

function TrueOrFalseContent() {
  const context = useQuestionContext<TrueFalseAnswer>();
  const { config, answer, setAnswer, isLocked, validation } = context;
  
  if (config.type !== 'true-false') {
    throw new Error('TrueOrFalse component requires a true-false config');
  }

  const handleChange = useCallback((value: boolean) => {
    if (isLocked) return;
    setAnswer(value);
  }, [isLocked, setAnswer]);

  const displayAs = config.displayAs || 'radio';

  const renderRadioButtons = () => (
    <div className="tf-options" role="radiogroup" aria-label="True or False">
      <label className={`tf-option ${answer.value === true ? 'tf-option-selected' : ''}`}>
        <input
          type="radio"
          name={`question-${config.id}`}
          value="true"
          checked={answer.value === true}
          onChange={() => handleChange(true)}
          disabled={isLocked}
        />
        <span className="tf-option-text">True</span>
      </label>
      <label className={`tf-option ${answer.value === false ? 'tf-option-selected' : ''}`}>
        <input
          type="radio"
          name={`question-${config.id}`}
          value="false"
          checked={answer.value === false}
          onChange={() => handleChange(false)}
          disabled={isLocked}
        />
        <span className="tf-option-text">False</span>
      </label>
    </div>
  );

  const renderButtons = () => (
    <div className="tf-buttons" role="group" aria-label="True or False">
      <button
        type="button"
        className={`tf-button ${answer.value === true ? 'tf-button-selected' : ''}`}
        onClick={() => handleChange(true)}
        disabled={isLocked}
        aria-pressed={answer.value === true}
      >
        True
      </button>
      <button
        type="button"
        className={`tf-button ${answer.value === false ? 'tf-button-selected' : ''}`}
        onClick={() => handleChange(false)}
        disabled={isLocked}
        aria-pressed={answer.value === false}
      >
        False
      </button>
    </div>
  );

  const renderToggle = () => (
    <div className="tf-toggle">
      <label className="tf-toggle-label">
        <input
          type="checkbox"
          checked={answer.value === true}
          onChange={(e) => handleChange(e.target.checked)}
          disabled={isLocked}
          role="switch"
          aria-checked={answer.value === true}
        />
        <span className="tf-toggle-slider"></span>
        <span className="tf-toggle-text">
          {answer.value === true ? 'True' : 'False'}
        </span>
      </label>
    </div>
  );

  return (
    <div className="true-false-question">
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

      {displayAs === 'radio' && renderRadioButtons()}
      {displayAs === 'buttons' && renderButtons()}
      {displayAs === 'toggle' && renderToggle()}

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

export function TrueOrFalse(props: TrueOrFalseProps) {
  const { config, ...baseProps } = props;

  return (
    <BaseQuestion<TrueFalseAnswer> config={config} {...baseProps}>
      <TrueOrFalseContent />
    </BaseQuestion>
  );
}