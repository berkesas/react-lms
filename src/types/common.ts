/**
 * Common types used across all components
 */

// Base metadata that all entities can have
export interface BaseMetadata {
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  tags?: string[];
  [key: string]: any; // Allow additional custom metadata
}

// Media attachment types
export type MediaType = 'image' | 'video' | 'audio' | 'document';

export interface MediaAttachment {
  id: string;
  type: MediaType;
  url: string;
  alt?: string;
  caption?: string;
  thumbnail?: string;
  mimeType?: string;
  size?: number; // in bytes
}

// Difficulty levels
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Feedback types
export type FeedbackType = 'correct' | 'incorrect' | 'partial' | 'hint';

export interface Feedback {
  type: FeedbackType;
  message: string;
  showAfter?: 'immediate' | 'submission' | 'grading';
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

// Accessibility configuration
export interface AccessibilityConfig {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  screenReaderText?: string;
  keyboardShortcuts?: Record<string, string>;
}