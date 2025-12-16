import type { QuizResult, LoadedQuizResult } from '../../types/quiz';

/**
 * Storage adapter interface - implement this for different storage backends
 */
export interface QuizStorageAdapter {
  /**
   * Save a quiz result
   */
  saveResult(result: QuizResult): Promise<void>;

  /**
   * Load a quiz result
   */
  loadResult(quizId: string, userId?: string, attemptNumber?: number): Promise<LoadedQuizResult | null>;

  /**
   * Load all results for a quiz
   */
  loadAllResults(quizId: string, userId?: string): Promise<LoadedQuizResult[]>;

  /**
   * Delete a result
   */
  deleteResult(quizId: string, userId?: string, attemptNumber?: number): Promise<void>;

  /**
   * Clear all results (for testing/dev)
   */
  clearAll?(): Promise<void>;
}

/**
 * Configuration for storage
 */
export interface StorageConfig {
  adapter: QuizStorageAdapter;
  userId?: string;
  autoSave?: boolean;
}