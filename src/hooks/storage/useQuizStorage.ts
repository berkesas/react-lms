import { useState, useCallback, useEffect } from 'react';
import type { QuizResult, LoadedQuizResult } from '../../types';
import type { QuizStorageManager } from '../../utils/storage';

export interface UseQuizStorageOptions {
  storageManager: QuizStorageManager;
  quizId: string;
  autoLoad?: boolean;
}

export interface UseQuizStorageReturn {
  latestResult: LoadedQuizResult | null;
  allAttempts: LoadedQuizResult[];
  statistics: {
    totalAttempts: number;
    bestScore: number;
    averageScore: number;
  };
  isLoading: boolean;
  error: Error | null;
  saveResult: (result: QuizResult) => Promise<LoadedQuizResult>;
  loadLatest: () => Promise<void>;
  loadAttempt: (attemptNumber: number) => Promise<LoadedQuizResult | null>;
  loadAllAttempts: () => Promise<void>;
  deleteAttempt: (attemptNumber: number) => Promise<void>;
  clearAll: () => Promise<void>;
}

export function useQuizStorage(options: UseQuizStorageOptions): UseQuizStorageReturn {
  const { storageManager, quizId, autoLoad = true } = options;

  const [latestResult, setLatestResult] = useState<LoadedQuizResult | null>(null);
  const [allAttempts, setAllAttempts] = useState<LoadedQuizResult[]>([]);
  const [statistics, setStatistics] = useState({
    totalAttempts: 0,
    bestScore: 0,
    averageScore: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const saveResult = useCallback(async (result: QuizResult) => {
    try {
      setError(null);
      const loadedResult = await storageManager.saveResult(result);

      // Reload data after save
      setLatestResult(loadedResult);
      // await loadLatest();
      await loadAllAttempts();
      return loadedResult;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [storageManager, quizId]);

  const loadLatest = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await storageManager.loadLatestResult(quizId);
      setLatestResult(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [storageManager, quizId]);

  const loadAttempt = useCallback(async (attemptNumber: number) => {
    try {
      setError(null);
      const result = await storageManager.loadAttempt(quizId, attemptNumber);
      return result;
    } catch (err) {
      setError(err as Error);
      return null;
    }
  }, [storageManager, quizId]);

  const loadAllAttempts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const attempts = await storageManager.loadAllAttempts(quizId);
      setAllAttempts(attempts);

      // Update statistics
      const stats = await storageManager.getQuizStatistics(quizId);
      setStatistics({
        totalAttempts: stats.totalAttempts,
        bestScore: stats.bestScore,
        averageScore: stats.averageScore,
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [storageManager, quizId]);

  const deleteAttempt = useCallback(async (attemptNumber: number) => {
    try {
      setError(null);
      await storageManager.deleteAttempt(quizId, attemptNumber);
      await loadAllAttempts();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [storageManager, quizId, loadAllAttempts]);

  const clearAll = useCallback(async () => {
    try {
      setError(null);
      await storageManager.deleteAllAttempts(quizId);
      setLatestResult(null);
      setAllAttempts([]);
      setStatistics({
        totalAttempts: 0,
        bestScore: 0,
        averageScore: 0,
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [storageManager, quizId]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      loadLatest();
      loadAllAttempts();
    }
  }, [autoLoad, loadLatest, loadAllAttempts]);

  return {
    latestResult,
    allAttempts,
    statistics,
    isLoading,
    error,
    saveResult,
    loadLatest,
    loadAttempt,
    loadAllAttempts,
    deleteAttempt,
    clearAll,
  };
}