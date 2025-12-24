// Common types
export * from './common';

// Question types
export * from './questions';

// Quiz types
export * from './quiz';

// Learner types
export * from './learners';

// Type guards for questions
import type { 
  QuestionConfig, 
  MultipleChoiceConfig,
  TrueOrFalseConfig,
  ShortAnswerConfig,
  EssayConfig,
  FillInBlankConfig,
  MatchingConfig
} from './questions';

export function isMultipleChoice(config: QuestionConfig): config is MultipleChoiceConfig {
  return config.type === 'multiple-choice';
}

export function isTrueOrFalse(config: QuestionConfig): config is TrueOrFalseConfig {
  return config.type === 'true-false';
}

export function isShortAnswer(config: QuestionConfig): config is ShortAnswerConfig {
  return config.type === 'short-answer';
}

export function isEssay(config: QuestionConfig): config is EssayConfig {
  return config.type === 'essay';
}

export function isFillInBlank(config: QuestionConfig): config is FillInBlankConfig {
  return config.type === 'fill-in-blank';
}

export function isMatching(config: QuestionConfig): config is MatchingConfig {
  return config.type === 'matching';
}