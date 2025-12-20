import { useCallback } from 'react';
import { BaseQuestion, BaseQuestionProps } from '../BaseQuestion';
import { useQuestionContext } from '../../../context/QuestionContext';
import type { FillInBlankConfig, FillInBlankAnswer, ContentRenderer } from '../../../types';

export interface FillInBlankProps extends Omit<BaseQuestionProps<FillInBlankAnswer>, 'config'> {
  config: FillInBlankConfig;
  renderContent?: ContentRenderer;
}

/**
 * Default content renderer - renders plain text safely
 * Users can override with custom renderer for Markdown/HTML support
 */
const defaultContentRenderer: ContentRenderer = (content) => {
  return <span>{content}</span>;
};

function FillInBlankContent() {
  const context = useQuestionContext<FillInBlankAnswer>();
  const { config, answer, setAnswer, isLocked, validation, renderContent } = context;

  // Use renderContent from context, fallback to default safe renderer
  const contentRenderer = renderContent || defaultContentRenderer;
  
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
        <span key={index} className="picolms-fib-text">
          {/* ✅ Use custom renderer for text segments */}
          {contentRenderer(segment.content || '', {
            type: 'question',
            questionId: config.id
          })}
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
        className="picolms-fib-blank"
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
    <div className="picolms-fill-in-blank-question">
      <div className="picolms-question-header">
        {config.title && (
          <h3 className="picolms-question-title">{config.title}</h3>
        )}
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

      <div className="picolms-fib-content">
        {config.segments.map((segment, index) => renderSegment(segment, index))}
      </div>

      {validation.errors.length > 0 && (
        <div className="picolms-question-errors" role="alert">
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

export function FillInBlank(props: FillInBlankProps) {
  const { config, renderContent, ...baseProps } = props;

  return (
    <BaseQuestion<FillInBlankAnswer> 
      config={config}
      renderContent={renderContent}
      {...baseProps}
    >
      <FillInBlankContent />
    </BaseQuestion>
  );
}