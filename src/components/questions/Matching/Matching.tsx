import { useCallback, useMemo } from 'react';
import { BaseQuestion, BaseQuestionProps } from '../BaseQuestion';
import { useQuestionContext } from '../../../context/QuestionContext';
import type { MatchingConfig, MatchingAnswer, ContentRenderer } from '../../../types';

export interface MatchingProps extends Omit<BaseQuestionProps<MatchingAnswer>, 'config'> {
  config: MatchingConfig;
  renderContent?: ContentRenderer;
}

/**
 * Default content renderer - renders plain text safely
 * Users can override with custom renderer for Markdown/HTML support
 */
const defaultContentRenderer: ContentRenderer = (content) => {
  return <span>{content}</span>;
};

/**
 * Fisher-Yates shuffle algorithm for randomizing array order
 * @param array - Array to shuffle
 * @param seed - Optional seed for deterministic shuffling
 * @returns Shuffled copy of the array
 */
function shuffleArray<T>(array: T[], seed?: number): T[] {
  const shuffled = [...array];
  const random = seed ? seededRandom(seed) : Math.random;
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Seeded random number generator for consistent shuffling
 * @param seed - Seed value for reproducible randomness
 * @returns Random number generator function
 */
function seededRandom(seed: number) {
  return function () {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

function MatchingContent() {
  const context = useQuestionContext<MatchingAnswer>();
  const { config, answer, setAnswer, isLocked, validation, renderContent } = context;

  // Use renderContent from context, fallback to default safe renderer
  const contentRenderer = renderContent || defaultContentRenderer;
  
  if (config.type !== 'matching') {
    throw new Error('Matching component requires a matching config');
  }

  const matches = answer.value || {};

  // Randomize if configured - using seeded shuffle for consistency
  const leftItems = useMemo(() => {
    const items = config.pairs.map(pair => ({
      id: pair.id,
      content: pair.left,
      media: pair.leftMedia,
    }));
    
    if (config.randomizeLeft) {
      const seed = config.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return shuffleArray(items, seed);
    }
    return items;
  }, [config.pairs, config.randomizeLeft, config.id]);

  const rightItems = useMemo(() => {
    const items = config.pairs.map(pair => ({
      id: pair.id,
      content: pair.right,
      media: pair.rightMedia,
    }));
    
    if (config.randomizeRight) {
      const seed = config.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + 1000;
      return shuffleArray(items, seed);
    }
    return items;
  }, [config.pairs, config.randomizeRight, config.id]);

  const handleMatch = useCallback((leftId: string, rightId: string) => {
    if (isLocked) return;
    
    const newMatches = {
      ...matches,
      [leftId]: rightId,
    };
    
    setAnswer(newMatches);
  }, [isLocked, matches, setAnswer]);

  const handleClearMatch = useCallback((leftId: string) => {
    if (isLocked) return;
    
    const newMatches = { ...matches };
    delete newMatches[leftId];
    
    setAnswer(newMatches);
  }, [isLocked, matches, setAnswer]);

  const isRightItemUsed = (rightId: string) => {
    return Object.values(matches).includes(rightId);
  };

  const getMatchedRightId = (leftId: string) => {
    return matches[leftId];
  };

  return (
    <div className="picolms-matching-question">
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

      <div className="picolms-matching-container">
        <div className="matching-left-column">
          <h4 className="picolms-matching-column-header">Match these items...</h4>
          {leftItems.map((item) => {
            const matchedRightId = getMatchedRightId(item.id);
            const matchedRight = rightItems.find(r => r.id === matchedRightId);
            
            return (
              <div key={item.id} className="picolms-matching-left-item">
                <div className="picolms-matching-item-content">
                  {item.media && item.media.type === 'image' && (
                    <img 
                      src={item.media.url} 
                      alt={item.media.alt || ''} 
                      className="picolms-matching-item-image"
                    />
                  )}
                  {/* ✅ Use custom renderer for left item text */}
                  <span className="matching-item-text">
                    {contentRenderer(item.content, {
                      type: 'option',
                      questionId: config.id,
                      optionId: item.id
                    })}
                  </span>
                </div>
                
                <div className="picolms-matching-controls">
                  <select
                    className="picolms-matching-select"
                    value={matchedRightId || ''}
                    onChange={(e) => handleMatch(item.id, e.target.value)}
                    disabled={isLocked}
                    aria-label={`Select match for ${item.content}`}
                  >
                    <option value="">Select a match...</option>
                    {rightItems.map((rightItem) => (
                      <option
                        key={rightItem.id}
                        value={rightItem.id}
                        disabled={isRightItemUsed(rightItem.id) && matchedRightId !== rightItem.id}
                      >
                        {rightItem.content}
                      </option>
                    ))}
                  </select>
                  
                  {matchedRightId && !isLocked && (
                    <button
                      type="button"
                      className="picolms-matching-clear-button"
                      onClick={() => handleClearMatch(item.id)}
                      aria-label="Clear match"
                    >
                      ✕
                    </button>
                  )}
                </div>
                
                {matchedRight && (
                  <div className="picolms-matching-preview">
                    → {/* ✅ Use custom renderer for matched preview */}
                    {contentRenderer(matchedRight.content, {
                      type: 'option',
                      questionId: config.id,
                      optionId: matchedRight.id
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="matching-right-column">
          <h4 className="picolms-matching-column-header">...with these options</h4>
          {rightItems.map((item) => {
            const isUsed = isRightItemUsed(item.id);
            
            return (
              <div 
                key={item.id} 
                className={`picolms-matching-right-item ${isUsed ? 'matching-right-item-used' : ''}`}
              >
                <div className="picolms-matching-item-content">
                  {item.media && item.media.type === 'image' && (
                    <img 
                      src={item.media.url} 
                      alt={item.media.alt || ''} 
                      className="picolms-matching-item-image"
                    />
                  )}
                  {/* ✅ Use custom renderer for right item text */}
                  <span className="matching-item-text">
                    {contentRenderer(item.content, {
                      type: 'option',
                      questionId: config.id,
                      optionId: item.id
                    })}
                  </span>
                </div>
                {isUsed && <span className="picolms-matching-used-indicator">✓</span>}
              </div>
            );
          })}
        </div>
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

export function Matching(props: MatchingProps) {
  const { config, renderContent, ...baseProps } = props;

  return (
    <BaseQuestion<MatchingAnswer> 
      config={config}
      renderContent={renderContent}
      {...baseProps}
    >
      <MatchingContent />
    </BaseQuestion>
  );
}