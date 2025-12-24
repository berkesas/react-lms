import { ReactNode, useCallback } from 'react';
import { BaseQuestion, BaseQuestionProps } from '../BaseQuestion';
import { useQuestionContext } from '../../../context/QuestionContext';
import type {
  TrueOrFalseConfig,
  TrueOrFalseAnswer,
  ContentRenderer,
} from '../../../types';
import { useTrueOrFalseValidation } from '../../../hooks/questions/useTrueOrFalseValidation';

export interface TrueOrFalseProps extends Omit<
  BaseQuestionProps<TrueOrFalseAnswer>,
  'config'
> {
  config: TrueOrFalseConfig;
  renderContent?: ContentRenderer;
  children?: ReactNode;
}

/**
 * Default content renderer - renders plain text safely
 * Users can override with custom renderer for Markdown/HTML support
 */
const defaultContentRenderer: ContentRenderer = (content) => {
  return <span>{content}</span>;
};

function TrueOrFalseContent() {
  const context = useQuestionContext<TrueOrFalseAnswer>();
  const {
    config,
    answer,
    setAnswer,
    showCheckButton,
    isLocked,
    validation,
    renderContent,
  } = context;

  // Use renderContent from context, fallback to default safe renderer
  const contentRenderer = renderContent || defaultContentRenderer;

  if (config.type !== 'true-false') {
    throw new Error('TrueOrFalse component requires a true-false config');
  }

  const handleChange = useCallback(
    (value: boolean) => {
      if (isLocked) return;
      setAnswer(value);
    },
    [isLocked, setAnswer]
  );

  const displayAs = config.displayAs || 'radio';

  const renderRadioButtons = () => (
    <div
      className="picolms-tf-options"
      role="radiogroup"
      aria-label="True or False"
    >
      <label
        className={`picolms-tf-option ${answer.value === true ? 'picolms-tf-option-selected' : ''}`}
      >
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
      <label
        className={`picolms-tf-option ${answer.value === false ? 'picolms-tf-option-selected' : ''}`}
      >
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
    <div className="picolms-tf-buttons" role="group" aria-label="True or False">
      <button
        type="button"
        className={`picolms-tf-button ${answer.value === true ? 'picolms-tf-button-selected' : ''}`}
        onClick={() => handleChange(true)}
        disabled={isLocked}
        aria-pressed={answer.value === true}
      >
        True
      </button>
      <button
        type="button"
        className={`picolms-tf-button ${answer.value === false ? 'picolms-tf-button-selected' : ''}`}
        onClick={() => handleChange(false)}
        disabled={isLocked}
        aria-pressed={answer.value === false}
      >
        False
      </button>
    </div>
  );

  const renderToggle = () => (
    <div className="picolms-tf-toggle">
      <label className="picolms-tf-toggle-label">
        <input
          type="checkbox"
          checked={answer.value === true}
          onChange={(e) => handleChange(e.target.checked)}
          disabled={isLocked}
          role="switch"
          aria-checked={answer.value === true}
        />
        <span className="picolms-tf-toggle-slider"></span>
        <span className="picolms-tf-toggle-text">
          {answer.value === true ? 'True' : 'False'}
        </span>
      </label>
    </div>
  );

  return (
    <div className="picolms-true-false-question">
      <div className="picolms-question-header">
        {config.title && (
          <h3 className="picolms-question-title">{config.title}</h3>
        )}
        {/* Use custom renderer for question text */}
        <div className="picolms-question-text">
          {contentRenderer(config.question, {
            type: 'question',
            questionId: config.id,
          })}
        </div>
        {config.instructions && (
          <p className="picolms-question-instructions">
            {/* Use custom renderer for instructions */}
            {contentRenderer(config.instructions, {
              type: 'instruction',
              questionId: config.id,
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

      {displayAs === 'radio' && renderRadioButtons()}
      {displayAs === 'buttons' && renderButtons()}
      {displayAs === 'toggle' && renderToggle()}

      {validation.errors.length > 0 && (
        <div className="picolms-question-errors" role="alert">
          {validation.errors.map((error, index) => (
            <p key={index} className="picolms-error-message">
              {error}
            </p>
          ))}
        </div>
      )}

      {context.feedback && context.showFeedback && (
        <div
          className={`picolms-question-feedback feedback-${context.feedback.type}`}
          role="status"
        >
          {context.feedback.message}
        </div>
      )}

      {config.feedback?.hints &&
        config.feedback.hints.length > 0 &&
        !isLocked && (
          <div className="picolms-question-hints">
            <details>
              <summary>Show Hint</summary>
              {config.feedback.hints.map((hint, index) => (
                <p key={index} className="picolms-hint-text">
                  {contentRenderer(hint, {
                    type: 'hint',
                    questionId: config.id,
                  })}
                </p>
              ))}
            </details>
          </div>
        )}

      {(config.points || config.difficulty) && (
        <div className="picolms-question-meta">
          {config.points && (
            <span className="picolms-question-points">
              {config.points} points
            </span>
          )}
          {config.difficulty && (
            <span className="picolms-question-difficulty">
              {config.difficulty}
            </span>
          )}
        </div>
      )}

      {showCheckButton && (
        <div className="picolms-question-actions">
          <button
            className="picolms-check-button"
            onClick={() => context.submit()}
            disabled={!context.isAnswered || isLocked}
          >
            Check
          </button>
        </div>
      )}
    </div>
  );
}

export function TrueOrFalse(props: TrueOrFalseProps) {
  const { config, renderContent, children, ...baseProps } = props;

  const enhancedValidationRules = useTrueOrFalseValidation(config);

  const enhancedConfig: TrueOrFalseConfig = {
    ...config,
    validation: {
      ...config.validation,
      rules: enhancedValidationRules,
    },
  };

  return (
    <BaseQuestion<TrueOrFalseAnswer>
      config={enhancedConfig}
      renderContent={renderContent}
      {...baseProps}
    >
      <TrueOrFalseContent />
      {children}
    </BaseQuestion>
  );
}
