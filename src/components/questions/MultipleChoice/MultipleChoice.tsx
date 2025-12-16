import React, { useCallback } from 'react';
import { BaseQuestion, BaseQuestionProps } from '../BaseQuestion';
import { useQuestionContext } from '../../../context/QuestionContext';
import type { MultipleChoiceConfig, MultipleChoiceAnswer } from '../../../types';

export interface MultipleChoiceProps extends Omit<BaseQuestionProps<MultipleChoiceAnswer>, 'config'> {
  config: MultipleChoiceConfig;
}

function MultipleChoiceContent() {
  const context = useQuestionContext<MultipleChoiceAnswer>();
  const { config, answer, setAnswer, isLocked, validation } = context;
  
  if (config.type !== 'multiple-choice') {
    throw new Error('MultipleChoice component requires a multiple-choice config');
  }

  const selectedIds = Array.isArray(answer.value) ? answer.value : answer.value ? [answer.value] : [];

  const handleOptionChange = useCallback((optionId: string) => {
    if (isLocked) return;

    if (config.allowMultiple) {
      // Multi-select mode
      const newSelection = selectedIds.includes(optionId)
        ? selectedIds.filter(id => id !== optionId)
        : [...selectedIds, optionId];

      // Check min/max selections
      if (config.maxSelections && newSelection.length > config.maxSelections) {
        return;
      }

      setAnswer(newSelection as MultipleChoiceAnswer);
    } else {
      // Single select mode
      setAnswer(optionId as MultipleChoiceAnswer);
    }
  }, [isLocked, config, selectedIds, setAnswer]);

  const renderOption = (option: typeof config.options[number], _index: number) => {
    const isSelected = selectedIds.includes(option.id);
    const inputType = config.allowMultiple ? 'checkbox' : 'radio';
    const inputName = `question-${config.id}`;

    return (
      <div
        key={option.id}
        className={`mc-option ${isSelected ? 'mc-option-selected' : ''} ${isLocked ? 'mc-option-locked' : ''}`}
      >
        <label className="mc-option-label">
          <input
            type={inputType}
            name={inputName}
            value={option.id}
            checked={isSelected}
            onChange={() => handleOptionChange(option.id)}
            disabled={isLocked}
            aria-describedby={option.feedback ? `feedback-${option.id}` : undefined}
          />
          <span className="mc-option-text">{option.text}</span>
          {option.media && (
            <div className="mc-option-media">
              {option.media.type === 'image' && (
                <img src={option.media.url} alt={option.media.alt || ''} />
              )}
            </div>
          )}
        </label>
        {option.feedback && isSelected && context.showFeedback && (
          <div id={`feedback-${option.id}`} className="mc-option-feedback">
            {option.feedback}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="multiple-choice-question">
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

      <div className="mc-options" role="group" aria-label="Answer options">
        {config.options.map((option, index) => renderOption(option, index))}
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

export function MultipleChoice(props: MultipleChoiceProps) {
  const { config, ...baseProps } = props;

  return (
    <BaseQuestion<MultipleChoiceAnswer> config={config} {...baseProps}>
      <MultipleChoiceContent />
    </BaseQuestion>
  );
}