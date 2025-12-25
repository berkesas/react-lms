import type { QuizResult, LoadedQuizResult } from '../../types/quiz';
import type { QuizStorageAdapter } from './types';

export interface ApiAdapterOptions {
  baseUrl: string;
  apiKey?: string;
  headers?: Record<string, string>;
  userId?: string;
  endpoints?: {  // ADD THIS
    save?: string;
    load?: string;
    loadAll?: string;
    delete?: string;
  };
}

/**
 * Backend API adapter for saving quiz results
 */
export class ApiQuizAdapter implements QuizStorageAdapter {
  private baseUrl: string;
  private headers: Record<string, string>;
  private userId?: string;
  private endpoints: {  // ADD THIS
    save: string;
    load: string;
    loadAll: string;
    delete: string;
  };

  constructor(options: ApiAdapterOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.userId = options.userId;

    this.endpoints = {
      save: options.endpoints?.save || '/quiz-results',
      load: options.endpoints?.load || '/quiz-results',
      loadAll: options.endpoints?.loadAll || '/quiz-results',
      delete: options.endpoints?.delete || '/quiz-results',
    };
    
    this.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (options.apiKey) {
      this.headers['Authorization'] = `Bearer ${options.apiKey}`;
    }
  }

  /**
   * Save quiz result to backend API
   */
  async saveResult(result: QuizResult): Promise<LoadedQuizResult> {
  try {
    const response = await fetch(`${this.baseUrl}${this.endpoints.save}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        userId: this.userId,
        quizId: result.quizId,
        attemptNumber: result.attemptNumber,
        score: result.score,
        maxScore: result.maxScore,
        percentage: result.percentage,
        isPassed: result.isPassed,
        timeSpent: result.timeSpent,
        submittedAt: result.submittedAt,
        answers: result.answers,
        submissions: result.submissions,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const savedData = await response.json();
    
    // Convert gradedAnswers array to Map if needed
    const loadedResult: LoadedQuizResult = {
      ...savedData,
      gradedAnswers: savedData.gradedAnswers 
        ? new Map(savedData.gradedAnswers)
        : undefined,
    };

    console.log('Quiz result saved to API:', result.quizId);
    return loadedResult;
  } catch (error) {
    console.error('Failed to save quiz result to API:', error);
    throw new Error('Failed to save quiz result to backend');
  }
}

  /**
   * Load quiz result from backend API
   */
  async loadResult(
    quizId: string,
    userId?: string,
    attemptNumber?: number
  ): Promise<LoadedQuizResult | null> {
    try {
      const params = new URLSearchParams({
        quizId,
        ...(userId && { userId }),
        ...(attemptNumber && { attemptNumber: String(attemptNumber) }),
      });

      const response = await fetch(
        `${this.baseUrl}${this.endpoints.load}?${params}`,
        {
          headers: this.headers,
        }
      );

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Convert gradedAnswers to Map if it's an array
      if (data.gradedAnswers && Array.isArray(data.gradedAnswers)) {
        data.gradedAnswers = new Map(data.gradedAnswers);
      }
      
      return data;
    } catch (error) {
      console.error('Failed to load quiz result from API:', error);
      return null;
    }
  }

  /**
   * Load all results for a quiz
   */
  async loadAllResults(quizId: string, userId?: string): Promise<LoadedQuizResult[]> {
    try {
      const params = new URLSearchParams({
        quizId,
        all: 'true',
        ...(userId && { userId }),
      });

      const response = await fetch(
        `${this.baseUrl}${this.endpoints.loadAll}?${params}`,
        {
          headers: this.headers,
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      return Array.isArray(data) ? data.map((result: any) => ({
        ...result,
        gradedAnswers: result.gradedAnswers 
          ? new Map(result.gradedAnswers)
          : undefined,
      })) : [];
    } catch (error) {
      console.error('Failed to load all quiz results from API:', error);
      return [];
    }
  }

  /**
   * Delete a quiz result
   */
  async deleteResult(
    quizId: string,
    userId?: string,
    attemptNumber?: number
  ): Promise<void> {
    try {
      const params = new URLSearchParams({
        quizId,
        ...(userId && { userId }),
        ...(attemptNumber && { attemptNumber: String(attemptNumber) }),
      });

      const response = await fetch(
        `${this.baseUrl}${this.endpoints.delete}?${params}`,
        {
          method: 'DELETE',
          headers: this.headers,
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to delete quiz result from API:', error);
      throw new Error('Failed to delete quiz result from backend');
    }
  }
}