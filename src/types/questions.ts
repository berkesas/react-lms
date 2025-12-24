import { BaseMetadata, MediaAttachment, DifficultyLevel, Feedback, AccessibilityConfig } from './common';

/**
 * Question types and configurations
 */

// All supported question types
export type QuestionType =
  | 'multiple-choice'
  | 'true-false'
  | 'short-answer'
  | 'essay'
  | 'fill-in-blank'
  | 'matching'
  | 'ordering'
  | 'file-upload';

// Base question configuration that all questions share
export interface BaseQuestionConfig {
  id: string;
  type: QuestionType;
  title?: string;
  question: string; // Main question text (supports HTML)
  instructions?: string;
  points: number;
  required?: boolean;
  difficulty?: DifficultyLevel;
  tags?: string[];
  category?: string;
  
  // Media
  media?: MediaAttachment[];
  
  // Feedback
  feedback?: {
    correct?: Feedback;
    incorrect?: Feedback;
    partial?: Feedback;
    hints?: string[];
  };
  
  // Time constraints
  timeLimit?: number; // in seconds
  
  // Attempts
  maxAttempts?: number;
  
  // Accessibility
  accessibility?: AccessibilityConfig;

  validation?: QuestionValidationConfig;
  
  // Metadata
  metadata?: BaseMetadata;
}

// Answer state for any question
export interface QuestionAnswer<T = any> {
  questionId: string;
  value: T;
  isAnswered: boolean;
  attemptNumber: number;
  timeSpent?: number; // in seconds
  timestamp?: string;
}

// Validation configuration
export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validate?: (value: any) => boolean | Promise<boolean>;
}

export interface QuestionValidationConfig {
  rules?: ValidationRule[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

// Multiple Choice specific types
export interface MultipleChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback?: string;
  media?: MediaAttachment;
}

export interface MultipleChoiceConfig extends BaseQuestionConfig {
  type: 'multiple-choice';
  options: MultipleChoiceOption[];
  allowMultiple?: boolean; // Single select vs multi-select
  shuffleOptions?: boolean;
  displayAs?: 'radio' | 'checkbox' | 'buttons' | 'dropdown';
  minSelections?: number;
  maxSelections?: number;
}

export type MultipleChoiceAnswer = string | string[]; // Single ID or array of IDs

// True/False specific types
export interface TrueOrFalseConfig extends BaseQuestionConfig {
  type: 'true-false';
  correctAnswer: boolean;
  displayAs?: 'radio' | 'buttons' | 'toggle';
}

export type TrueOrFalseAnswer = boolean;

// Short Answer specific types
export interface ShortAnswerConfig extends BaseQuestionConfig {
  type: 'short-answer';
  correctAnswers?: string[]; // Multiple acceptable answers
  caseSensitive?: boolean;
  trimWhitespace?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string; // Regex pattern
  placeholder?: string;
  validation?: QuestionValidationConfig;
}

export type ShortAnswerAnswer = string;

// Essay specific types
export interface EssayConfig extends BaseQuestionConfig {
  type: 'essay';
  minWords?: number;
  maxWords?: number;
  minCharacters?: number;
  maxCharacters?: number;
  placeholder?: string;
  enableRichText?: boolean;
}

export type EssayAnswer = string;

// Fill in the Blank specific types
export interface FillInBlankSegment {
  type: 'text' | 'blank';
  content?: string; // For text segments
  id?: string; // For blank segments
  correctAnswers?: string[]; // For blank segments
  caseSensitive?: boolean;
  placeholder?: string;
}

export interface FillInBlankConfig extends BaseQuestionConfig {
  type: 'fill-in-blank';
  segments: FillInBlankSegment[];
}

export type FillInBlankAnswer = Record<string, string>; // Map of blank ID to answer

// Matching specific types
export interface MatchingPair {
  id: string;
  left: string;
  right: string;
  leftMedia?: MediaAttachment;
  rightMedia?: MediaAttachment;
}

export interface MatchingConfig extends BaseQuestionConfig {
  type: 'matching';
  pairs: MatchingPair[];
  randomizeLeft?: boolean;
  randomizeRight?: boolean;
}

export type MatchingAnswer = Record<string, string>; // Map of left ID to right ID

// Union type for all question configs
export type QuestionConfig =
  | MultipleChoiceConfig
  | TrueOrFalseConfig
  | ShortAnswerConfig
  | EssayConfig
  | FillInBlankConfig
  | MatchingConfig;

// Submission state
export type SubmissionStatus = 'not-started' | 'in-progress' | 'submitted' | 'graded';

export interface QuestionSubmission {
  questionId: string;
  answer: QuestionAnswer;
  status: SubmissionStatus;
  score?: number;
  maxScore: number;
  feedback?: Feedback[];
  submittedAt?: string;
  gradedAt?: string;
  gradedBy?: string;
}

// Question state (internal component state)
export interface QuestionState<T = any> {
  config: QuestionConfig;
  answer: QuestionAnswer<T>;
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
  status: SubmissionStatus;
  timeSpent: number;
  attemptNumber: number;
  isLocked: boolean;
}