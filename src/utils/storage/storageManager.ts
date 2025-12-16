import type { QuizResult, LoadedQuizResult } from '../../types/quiz';
import type { QuizStorageAdapter, StorageConfig } from './types';
import { LocalStorageQuizAdapter } from './localStorageAdapter';
import { ApiQuizAdapter } from './apiAdapter';

/**
 * Storage manager for quiz results
 */
export class QuizStorageManager {
  private adapter: QuizStorageAdapter;
  private userId?: string;

  constructor(config: StorageConfig) {
    this.adapter = config.adapter;
    this.userId = config.userId;
  }

  /**
   * Save a quiz result
   */
  async saveResult(result: QuizResult): Promise<void> {
    return this.adapter.saveResult(result);
  }

  /**
   * Load the latest result for a quiz
   */
  async loadLatestResult(quizId: string): Promise<LoadedQuizResult | null> {
    return this.adapter.loadResult(quizId, this.userId);
  }

  /**
   * Load a specific attempt
   */
  async loadAttempt(quizId: string, attemptNumber: number): Promise<LoadedQuizResult | null> {
    return this.adapter.loadResult(quizId, this.userId, attemptNumber);
  }

  /**
   * Load all attempts for a quiz
   */
  async loadAllAttempts(quizId: string): Promise<LoadedQuizResult[]> {
    return this.adapter.loadAllResults(quizId, this.userId);
  }

  /**
   * Delete a specific attempt
   */
  async deleteAttempt(quizId: string, attemptNumber: number): Promise<void> {
    return this.adapter.deleteResult(quizId, this.userId, attemptNumber);
  }

  /**
   * Delete all attempts for a quiz
   */
  async deleteAllAttempts(quizId: string): Promise<void> {
    return this.adapter.deleteResult(quizId, this.userId);
  }

  /**
   * Clear all saved results
   */
  async clearAll(): Promise<void> {
    if (this.adapter.clearAll) {
      return this.adapter.clearAll();
    }
  }

  /**
   * Get statistics for a quiz
   */
  async getQuizStatistics(quizId: string): Promise<{
    totalAttempts: number;
    bestScore: number;
    averageScore: number;
    lastAttempt?: LoadedQuizResult;
  }> {
    const attempts = await this.loadAllAttempts(quizId);
    
    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        bestScore: 0,
        averageScore: 0,
      };
    }

    const scores = attempts.map(a => a.score);
    const bestScore = Math.max(...scores);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    return {
      totalAttempts: attempts.length,
      bestScore,
      averageScore,
      lastAttempt: attempts[attempts.length - 1],
    };
  }
}

/**
 * Create a storage manager with localStorage
 */
export function createLocalStorageManager(userId: string = 'default_user'): QuizStorageManager {
  return new QuizStorageManager({
    adapter: new LocalStorageQuizAdapter({ userId }),
    userId,
  });
}

/**
 * Create a storage manager with API backend
 */
export function createApiStorageManager(
  baseUrl: string,
  userId: string,
  apiKey?: string
): QuizStorageManager {
  return new QuizStorageManager({
    adapter: new ApiQuizAdapter({ baseUrl, userId, apiKey }),
    userId,
  });
}