import { ReactNode } from "react";

/**
 * Common types used across all components
 */

/**
 * Content renderer function type
 * @param content - The content to render (string, HTML, Markdown, etc.)
 * @param context - Additional context about where/how content is used
 * @returns Rendered React node
 */
export type ContentRenderer = (
  content: string,
  context?: {
    type: 'question' | 'option' | 'instruction' | 'feedback' | 'hint';
    questionId?: string;
    optionId?: string;
  }
) => ReactNode;

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