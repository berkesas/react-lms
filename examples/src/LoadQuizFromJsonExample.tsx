import { useState, useEffect } from 'react';
import {
  Quiz,
  QuizNavigation,
  QuizProgressBar,
  QuizResults,
  MultipleChoice,
  TrueOrFalse,
  ShortAnswer,
} from '@lms-components/components';
import { useQuizContext } from '@lms-components/context';
import { useQuizStorage } from '@lms-components/hooks';
import { createLocalStorageManager } from '@lms-components/utils';
import type { QuizConfig, QuizResult } from '@lms-components/types';

// Create storage manager (do this once, outside component)
const storageManager = createLocalStorageManager('demo_user');

// Load Quiz from JSON File with Storage
export function LoadQuizFromJsonExample() {
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoSaveInterval, setAutoSaveInterval] = useState(2000);

  useEffect(() => {
    loadQuizData('quizzes/quiz1.json');
  }, []);

  const loadQuizData = async (filePath: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(filePath);

      if (!response.ok) {
        throw new Error(`Failed to load quiz: ${response.statusText}`);
      }

      const data = await response.json();

      if (!validateQuizConfig(data)) {
        throw new Error('Invalid quiz configuration format');
      }

      setQuizConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz');
      console.error('Error loading quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateQuizConfig = (config: any): boolean => {
    return (
      config &&
      typeof config.id === 'string' &&
      typeof config.title === 'string' &&
      Array.isArray(config.questions) &&
      config.questions.length > 0
    );
  };

  if (loading) {
    return (
      <div className="example-container">
        <h1>Loading Quiz...</h1>
        <p>Please wait while we load the quiz data.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="example-container">
        <h1>Error Loading Quiz</h1>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => loadQuizData('quizzes/quiz1.json')}>
          Try Again
        </button>
      </div>
    );
  }

  if (!quizConfig) {
    return (
      <div className="example-container">
        <h1>No Quiz Data</h1>
        <p>Quiz configuration is not available.</p>
      </div>
    );
  }

  return (
    <QuizWithStorage
      quizConfig={quizConfig}
      autoSaveInterval={autoSaveInterval}
      setAutoSaveInterval={setAutoSaveInterval}
    />
  );
}

// Quiz Library with Storage
export function QuizLibraryExample() {
  const [availableQuizzes, setAvailableQuizzes] = useState<
    {
      id: string;
      title: string;
      description: string;
      filePath: string;
    }[]
  >([]);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoSaveInterval, setAutoSaveInterval] = useState(2000);

  useEffect(() => {
    loadQuizLibrary();
  }, []);

  const loadQuizLibrary = async () => {
    try {
      const response = await fetch('quizzes/index.json');
      const data = await response.json();
      setAvailableQuizzes(data.quizzes);
    } catch (err) {
      console.error('Error loading quiz library:', err);
    }
  };

  const loadSpecificQuiz = async (filePath: string) => {
    try {
      setLoading(true);
      const response = await fetch(filePath);
      const data = await response.json();
      setSelectedQuiz(data);
    } catch (err) {
      console.error('Error loading quiz:', err);
      alert('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedQuiz) {
    return (
      <div className="example-container">
        <h1>Quiz Library</h1>
        <p>Select a quiz to begin:</p>
        <div className="quiz-list">
          {availableQuizzes.map((quiz) => (
            <div key={quiz.id} className="quiz-card">
              <h3>{quiz.title}</h3>
              <p>{quiz.description}</p>
              <button
                onClick={() => loadSpecificQuiz(quiz.filePath)}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Start Quiz'}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="example-container">
      <button onClick={() => setSelectedQuiz(null)}>
        ← Back to Quiz Library
      </button>
      <QuizWithStorage
        quizConfig={selectedQuiz}
        autoSaveInterval={autoSaveInterval}
        setAutoSaveInterval={setAutoSaveInterval}
      />
    </div>
  );
}

// Dynamic Quiz Loader with Storage
export function DynamicQuizLoaderExample() {
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [quizId, setQuizId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSaveInterval, setAutoSaveInterval] = useState(2000);

  const loadQuizById = async (id: string) => {
    if (!id.trim()) {
      setError('Please enter a quiz ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`quizzes/${id}.json`);

      if (!response.ok) {
        throw new Error('Quiz not found');
      }

      const data = await response.json();
      setQuizConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz');
      setQuizConfig(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="example-container">
      <h1>Dynamic Quiz Loader</h1>

      {!quizConfig ? (
        <div className="quiz-loader">
          <label htmlFor="quiz-id">Enter Quiz ID:</label>
          <input
            id="quiz-id"
            type="text"
            value={quizId}
            onChange={(e) => setQuizId(e.target.value)}
            placeholder="e.g., react-basics, javascript-101"
          />
          <button onClick={() => loadQuizById(quizId)} disabled={loading}>
            {loading ? 'Loading...' : 'Load Quiz'}
          </button>

          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      ) : (
        <>
          <button onClick={() => setQuizConfig(null)}>
            Load Different Quiz
          </button>
          <QuizWithStorage
            quizConfig={quizConfig}
            autoSaveInterval={autoSaveInterval}
            setAutoSaveInterval={setAutoSaveInterval}
          />
        </>
      )}
    </div>
  );
}

// Reusable Quiz Component with Storage and Grading
function QuizWithStorage({
  quizConfig,
  autoSaveInterval,
  setAutoSaveInterval,
}: {
  quizConfig: QuizConfig;
  autoSaveInterval: number;
  setAutoSaveInterval: (interval: number) => void;
}) {
  const storage = useQuizStorage({
    storageManager,
    quizId: quizConfig.id,
    autoLoad: true,
  });

  const [showingResults, setShowingResults] = useState(false);

  const handleQuizSubmit = async (result: QuizResult) => {
    console.log('Quiz submitted:', result);

    // Save graded result to storage
    await storage.saveResult(result);

    console.log('Graded result saved:', {
      score: result.score,
      percentage: result.percentage,
      isPassed: result.isPassed,
    });

    // Show results
    setShowingResults(true);
    console.log(storage.latestResult);
  };

  const handleRetake = () => {
    setShowingResults(false);
  };

  return (
    <>
      <h1>{quizConfig.title}</h1>
      <p>{quizConfig.description}</p>

      {/* AUTO-SAVE CONTROLS */}
      <div
        style={{
          marginBottom: '1rem',
          padding: '1rem',
          borderRadius: '0.5rem',
        }}
      >
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Auto-save interval:</span>
            <select
              value={autoSaveInterval}
              onChange={(e) => setAutoSaveInterval(Number(e.target.value))}
            >
              <option value={0}>Disabled</option>
              <option value={1000}>1 second</option>
              <option value={2000}>2 seconds</option>
              <option value={5000}>5 seconds</option>
              <option value={10000}>10 seconds</option>
              <option value={30000}>30 seconds</option>
            </select>
          </label>
        </div>

        <div
          style={{
            marginTop: '0.5rem',
            fontSize: '0.875rem',
            color: '#6b7280',
          }}
        >
          {autoSaveInterval === 0
            ? '⚠️ Auto-save is disabled'
            : `✓ Auto-saving every ${autoSaveInterval / 1000} second(s)`}
        </div>
      </div>

      {/* Storage Statistics */}
      <div
        className="storage-stats"
        style={{
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '2rem',
        }}
      >
        <h3>Your Statistics</h3>
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
          <div>
            <strong>Total Attempts:</strong> {storage.statistics.totalAttempts}
          </div>
          <div>
            <strong>Best Score:</strong>{' '}
            {storage.statistics.bestScore.toFixed(1)}
          </div>
          <div>
            <strong>Average Score:</strong>{' '}
            {storage.statistics.averageScore.toFixed(1)}
          </div>
        </div>

        {storage.allAttempts.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <strong>Attempt History:</strong>
            <ul>
              {storage.allAttempts.map((attempt) => (
                <li key={attempt.attemptNumber}>
                  Attempt {attempt.attemptNumber}: {attempt.score}/
                  {attempt.maxScore} ({attempt.percentage.toFixed(1)}%) -{' '}
                  {new Date(attempt.submittedAt).toLocaleString()}
                  <button
                    onClick={() => storage.deleteAttempt(attempt.attemptNumber)}
                    style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem' }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {storage.allAttempts.length > 0 && (
          <button
            onClick={storage.clearAll}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
            }}
          >
            Clear All Attempts
          </button>
        )}
      </div>

      {/* Show results or quiz */}
      {showingResults && storage.latestResult ? (
        <Quiz config={quizConfig} loadedResult={storage.latestResult}>
          <QuizResults onRetake={handleRetake} />
        </Quiz>
      ) : (
        <Quiz
          config={quizConfig}
          onQuizSubmit={handleQuizSubmit}
          storageManager={storageManager}
          autoSaveInterval={autoSaveInterval}
        >
          <QuizContent />
        </Quiz>
      )}
    </>
  );
}

// Quiz Content Component (reusable)
function QuizContent() {
  const { currentQuestion, setAnswer } = useQuizContext();

  if (!currentQuestion) return null;

  return (
    <>
      <QuizProgressBar />
      <div className="quiz-question-wrapper">
        {currentQuestion.type === 'multiple-choice' && (
          <MultipleChoice
            config={currentQuestion as any}
            onAnswerChange={(answer) => setAnswer(currentQuestion.id, answer)}
          />
        )}
        {currentQuestion.type === 'true-false' && (
          <TrueOrFalse
            config={currentQuestion as any}
            onAnswerChange={(answer) => setAnswer(currentQuestion.id, answer)}
          />
        )}
        {currentQuestion.type === 'short-answer' && (
          <ShortAnswer
            config={currentQuestion as any}
            onAnswerChange={(answer) => setAnswer(currentQuestion.id, answer)}
          />
        )}
      </div>
      <QuizNavigation showQuestionList />
    </>
  );
}

// Example index.json structure
/*
{
  "quizzes": [
    {
      "id": "quiz1",
      "title": "Capitals of the World",
      "description": "Test your knowledge of world capitals",
      "filePath": "quizzes/quiz1.json"
    },
    {
      "id": "react-basics",
      "title": "React Basics",
      "description": "Fundamental React concepts",
      "filePath": "quizzes/react-basics.json"
    },
    {
      "id": "javascript-101",
      "title": "JavaScript 101",
      "description": "Core JavaScript concepts",
      "filePath": "quizzes/javascript-101.json"
    }
  ]
}
*/
