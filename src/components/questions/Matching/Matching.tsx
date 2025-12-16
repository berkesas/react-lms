import { useCallback, useMemo } from 'react';
import { BaseQuestion, BaseQuestionProps } from '../BaseQuestion';
import { useQuestionContext } from '../../../context/QuestionContext';
import type { MatchingConfig, MatchingAnswer } from '../../../types';

export interface MatchingProps extends Omit<BaseQuestionProps<MatchingAnswer>, 'config'> {
  config: MatchingConfig;
}

function MatchingContent() {
  const context = useQuestionContext<MatchingAnswer>();
  const { config, answer, setAnswer, isLocked, validation } = context;
  
  if (config.type !== 'matching') {
    throw new Error('Matching component requires a matching config');
  }

  const matches = answer.value || {};

  // Randomize if configured
  const leftItems = useMemo(() => {
    const items = config.pairs.map(pair => ({
      id: pair.id,
      content: pair.left,
      media: pair.leftMedia,
    }));
    
    if (config.randomizeLeft) {
      return [...items].sort(() => Math.random() - 0.5);
    }
    return items;
  }, [config.pairs, config.randomizeLeft]);

  const rightItems = useMemo(() => {
    const items = config.pairs.map(pair => ({
      id: pair.id,
      content: pair.right,
      media: pair.rightMedia,
    }));
    
    if (config.randomizeRight) {
      return [...items].sort(() => Math.random() - 0.5);
    }
    return items;
  }, [config.pairs, config.randomizeRight]);

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
                  <span className="matching-item-text">{item.content}</span>
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
                    → {matchedRight.content}
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
                  <span className="matching-item-text">{item.content}</span>
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

export function Matching(props: MatchingProps) {
  const { config, ...baseProps } = props;

  return (
    <BaseQuestion<MatchingAnswer> config={config} {...baseProps}>
      <MatchingContent />
    </BaseQuestion>
  );
}