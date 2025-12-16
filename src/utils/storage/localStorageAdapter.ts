import type { QuizResult, LoadedQuizResult } from '../../types/quiz';
import type { QuizStorageAdapter } from './types';

export interface LocalStorageOptions {
  keyPrefix?: string;
  userId?: string;
}

/**
 * LocalStorage adapter for saving quiz results
 */
export class LocalStorageQuizAdapter implements QuizStorageAdapter {
  private keyPrefix: string;
  private userId: string;

  constructor(options: LocalStorageOptions = {}) {
    this.keyPrefix = options.keyPrefix || 'lms_quiz';
    this.userId = options.userId || 'default_user';
  }

  private getKey(quizId: string, attemptNumber?: number): string {
    if (attemptNumber) {
      return `${this.keyPrefix}_${this.userId}_${quizId}_attempt_${attemptNumber}`;
    }
    return `${this.keyPrefix}_${this.userId}_${quizId}_latest`;
  }

  private getIndexKey(): string {
    return `${this.keyPrefix}_${this.userId}_index`;
  }

  /**
   * Save quiz result to localStorage
   */
  async saveResult(result: QuizResult): Promise<void> {
    try {
      const loadedResult: LoadedQuizResult = {
        quizId: result.quizId,
        submittedAt: result.submittedAt,
        score: result.score,
        maxScore: result.maxScore,
        percentage: result.percentage,
        isPassed: result.isPassed,
        attemptNumber: result.attemptNumber,
        answers: result.answers,
        gradedAnswers: new Map(
          result.submissions.map(sub => [
            sub.questionId,
            {
              isCorrect: sub.score === sub.maxScore,
              score: sub.score || 0,
              feedback: sub.feedback?.[0]?.message,
            }
          ])
        ),
      };

      // Save the result
      const key = this.getKey(result.quizId, result.attemptNumber);
      localStorage.setItem(key, JSON.stringify({
        ...loadedResult,
        gradedAnswers: Array.from(loadedResult.gradedAnswers?.entries() || []),
      }));

      // Also save as latest
      const latestKey = this.getKey(result.quizId);
      localStorage.setItem(latestKey, JSON.stringify({
        ...loadedResult,
        gradedAnswers: Array.from(loadedResult.gradedAnswers?.entries() || []),
      }));

      // Update index
      this.updateIndex(result.quizId, result.attemptNumber);

      console.log('Quiz result saved to localStorage:', result.quizId);
    } catch (error) {
      console.error('Failed to save quiz result to localStorage:', error);
      throw new Error('Failed to save quiz result');
    }
  }

  /**
   * Load quiz result from localStorage
   */
  async loadResult(
    quizId: string,
    _userId?: string,
    attemptNumber?: number
  ): Promise<LoadedQuizResult | null> {
    try {
      const key = attemptNumber 
        ? this.getKey(quizId, attemptNumber)
        : this.getKey(quizId);

      const data = localStorage.getItem(key);
      
      if (!data) {
        return null;
      }

      const parsed = JSON.parse(data);
      
      // Convert gradedAnswers array back to Map
      return {
        ...parsed,
        gradedAnswers: new Map(parsed.gradedAnswers || []),
      };
    } catch (error) {
      console.error('Failed to load quiz result from localStorage:', error);
      return null;
    }
  }

  /**
   * Load all results for a quiz
   */
  async loadAllResults(quizId: string, userId?: string): Promise<LoadedQuizResult[]> {
    try {
      const index = this.getIndex();
      const quizAttempts = index[quizId] || [];
      
      const results: LoadedQuizResult[] = [];
      
      for (const attemptNumber of quizAttempts) {
        const result = await this.loadResult(quizId, userId, attemptNumber);
        if (result) {
          results.push(result);
        }
      }
      
      return results.sort((a, b) => a.attemptNumber - b.attemptNumber);
    } catch (error) {
      console.error('Failed to load all quiz results:', error);
      return [];
    }
  }

  /**
   * Delete a quiz result
   */
  async deleteResult(
    quizId: string,
    _userId?: string,
    attemptNumber?: number
  ): Promise<void> {
    try {
      if (attemptNumber) {
        const key = this.getKey(quizId, attemptNumber);
        localStorage.removeItem(key);
        this.removeFromIndex(quizId, attemptNumber);
      } else {
        // Delete all attempts
        const index = this.getIndex();
        const attempts = index[quizId] || [];
        
        for (const attempt of attempts) {
          const key = this.getKey(quizId, attempt);
          localStorage.removeItem(key);
        }
        
        // Remove from index
        delete index[quizId];
        localStorage.setItem(this.getIndexKey(), JSON.stringify(index));
        
        // Remove latest
        localStorage.removeItem(this.getKey(quizId));
      }
    } catch (error) {
      console.error('Failed to delete quiz result:', error);
      throw new Error('Failed to delete quiz result');
    }
  }

  /**
   * Clear all results
   */
  async clearAll(): Promise<void> {
    try {
      const keys = Object.keys(localStorage);
      const prefix = `${this.keyPrefix}_${this.userId}`;
      
      for (const key of keys) {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      }
      
      console.log('All quiz results cleared from localStorage');
    } catch (error) {
      console.error('Failed to clear quiz results:', error);
      throw new Error('Failed to clear quiz results');
    }
  }

  /**
   * Get the index of all saved quizzes
   */
  private getIndex(): Record<string, number[]> {
    try {
      const data = localStorage.getItem(this.getIndexKey());
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  /**
   * Update the index with a new quiz attempt
   */
  private updateIndex(quizId: string, attemptNumber: number): void {
    const index = this.getIndex();
    
    if (!index[quizId]) {
      index[quizId] = [];
    }
    
    if (!index[quizId].includes(attemptNumber)) {
      index[quizId].push(attemptNumber);
      index[quizId].sort((a, b) => a - b);
    }
    
    localStorage.setItem(this.getIndexKey(), JSON.stringify(index));
  }

  /**
   * Remove an attempt from the index
   */
  private removeFromIndex(quizId: string, attemptNumber: number): void {
    const index = this.getIndex();
    
    if (index[quizId]) {
      index[quizId] = index[quizId].filter(n => n !== attemptNumber);
      
      if (index[quizId].length === 0) {
        delete index[quizId];
      }
      
      localStorage.setItem(this.getIndexKey(), JSON.stringify(index));
    }
  }
}