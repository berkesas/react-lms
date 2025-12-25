import { useState } from 'react';
import {
  Quiz,
  QuizNavigation,
  QuizProgressBar,
  QuizResults,
  MultipleChoice,
} from '@lms-components/components';
import { useQuizContext } from '@lms-components/context';
import { useQuizStorage } from '@lms-components/hooks'; // Only hook from hooks
import { createLocalStorageManager } from '@lms-components/utils'; // Storage manager from utils
import type { QuizConfig, QuizResult } from '@lms-components/types';

// Create storage manager (do this once, outside component or in a context)
const storageManager = createLocalStorageManager('demo_user');

export function StorageExample() {
  const quizConfig: QuizConfig = {
    id: 'quiz-storage',
    title: 'Quiz with Auto-Save',
    description: 'Your results will be saved automatically',
    submissionMode: 'quiz-level',
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'What is React?',
        points: 10,
        options: [
          { id: 'opt1', text: 'A library', isCorrect: true },
          { id: 'opt2', text: 'A framework', isCorrect: false },
          { id: 'opt3', text: 'A language', isCorrect: false },
        ],
        allowMultiple: false,
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: 'Which are JavaScript frameworks?',
        points: 10,
        options: [
          { id: 'opt1', text: 'React', isCorrect: true },
          { id: 'opt2', text: 'Vue', isCorrect: true },
          { id: 'opt3', text: 'HTML', isCorrect: false },
        ],
        allowMultiple: true,
      },
    ],
    allowNavigation: true,
    passingScore: 70,
    showCorrectAnswers: true,
  };

  const storage = useQuizStorage({
    storageManager,
    quizId: quizConfig.id,
    autoLoad: true,
  });

  const [showingResults, setShowingResults] = useState(false);

  const handleQuizSubmit = async (result: QuizResult) => {
    // Result is already graded by useQuizState!
    console.log('Quiz submitted:', result);

    // Save to storage (already graded)
    await storage.saveResult(result);

    console.log('Graded result saved:', {
      score: result.score,
      percentage: result.percentage,
      isPassed: result.isPassed,
    });

    // Optionally show results immediately
    setShowingResults(true);
  };

  const handleRetake = () => {
    setShowingResults(false);
  };

  const [autoSaveInterval, setAutoSaveInterval] = useState(2000);
  return (
    <div className="example-container">
      <h1>Quiz with Storage Example</h1>
      <p>
        This quiz automatically saves your results. Try submitting and
        refreshing the page!
      </p>

      {/* AUTO-SAVE CONTROLS - SIMPLIFIED */}
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
                  {attempt.maxScore}({attempt.percentage.toFixed(1)}%) -
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

      {/* Show results if available */}
      {showingResults && storage.latestResult ? (
        <Quiz config={quizConfig} loadedResult={storage.latestResult}>
          <QuizResults onRetake={handleRetake} />
        </Quiz>
      ) : (
        <Quiz
          config={quizConfig}
          onQuizSubmit={handleQuizSubmit}
          storageManager={storageManager}
          autoSaveInterval={autoSaveInterval} // SINGLE PROP
        >
          <QuizContent />
        </Quiz>
      )}
    </div>
  );
}

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
      </div>
      <QuizNavigation showQuestionList />
    </>
  );
}
