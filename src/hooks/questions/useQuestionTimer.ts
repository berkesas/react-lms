import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseQuestionTimerOptions {
  timeLimit?: number; // in seconds
  onTimeUp?: () => void;
  onTick?: (timeRemaining: number) => void;
  autoStart?: boolean;
}

export interface UseQuestionTimerReturn {
  timeRemaining: number;
  timeElapsed: number;
  isRunning: boolean;
  isTimeUp: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  progress: number; // 0-100 percentage
}

export function useQuestionTimer(
  options: UseQuestionTimerOptions
): UseQuestionTimerReturn {
  const { timeLimit, onTimeUp, onTick, autoStart = false } = options;

  const [timeRemaining, setTimeRemaining] = useState(timeLimit || 0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isTimeUp, setIsTimeUp] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Start timer
  const start = useCallback(() => {
    setIsRunning(true);
    startTimeRef.current = Date.now();
  }, []);

  // Pause timer
  const pause = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Resume timer
  const resume = useCallback(() => {
    setIsRunning(true);
    startTimeRef.current = Date.now();
  }, []);

  // Reset timer
  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeRemaining(timeLimit || 0);
    setTimeElapsed(0);
    setIsTimeUp(false);
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [timeLimit]);

  // Timer effect
  useEffect(() => {
    if (isRunning && timeLimit && timeLimit > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeElapsed((prev) => {
          const newElapsed = prev + 1;
          const newRemaining = Math.max(0, timeLimit - newElapsed);
          
          setTimeRemaining(newRemaining);

          // Call tick callback
          if (onTick) {
            onTick(newRemaining);
          }

          // Check if time is up
          if (newRemaining === 0 && !isTimeUp) {
            setIsTimeUp(true);
            setIsRunning(false);
            if (onTimeUp) {
              onTimeUp();
            }
            if (intervalRef.current !== null) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }

          return newElapsed;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, timeLimit, onTimeUp, onTick, isTimeUp]);

  // Calculate progress percentage
  const progress = timeLimit ? ((timeLimit - timeRemaining) / timeLimit) * 100 : 0;

  return {
    timeRemaining,
    timeElapsed,
    isRunning,
    isTimeUp,
    start,
    pause,
    resume,
    reset,
    progress,
  };
}