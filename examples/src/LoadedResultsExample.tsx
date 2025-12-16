import { useState } from 'react';
import { Quiz, QuizResults } from '@lms-components/components';
import type { QuizConfig, LoadedQuizResult } from '@lms-components/types';

export function LoadedResultsExample() {
  const [showResults, setShowResults] = useState(true);

  const quizConfig: QuizConfig = {
    id: 'quiz-results',
    title: 'Previously Submitted Quiz',
    description: 'View your previous submission',
    submissionMode: 'quiz-level',
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'What is 2 + 2?',
        points: 10,
        options: [
          { id: 'opt1', text: '3', isCorrect: false },
          { id: 'opt2', text: '4', isCorrect: true },
          { id: 'opt3', text: '5', isCorrect: false },
        ],
        allowMultiple: false,
      },
      {
        id: 'q2',
        type: 'true-false',
        question: 'The sky is blue.',
        points: 5,
        correctAnswer: true,
      },
    ],
    allowNavigation: true,
    passingScore: 70,
    showCorrectAnswers: true,
  };

  // Simulated loaded result from database/API
  const loadedResult: LoadedQuizResult = {
    quizId: 'quiz-results',
    submittedAt: '2024-01-15T10:30:00Z',
    score: 10,
    maxScore: 15,
    percentage: 66.67,
    isPassed: false,
    attemptNumber: 1,
    answers: [
      {
        questionId: 'q1',
        value: 'opt2',
        isAnswered: true,
        attemptNumber: 1,
        timeSpent: 15,
        timestamp: '2024-01-15T10:30:00Z',
      },
      {
        questionId: 'q2',
        value: false,
        isAnswered: true,
        attemptNumber: 1,
        timeSpent: 8,
        timestamp: '2024-01-15T10:30:00Z',
      },
    ],
    gradedAnswers: new Map([
      ['q1', {
        isCorrect: true,
        score: 10,
        feedback: 'Correct! 2 + 2 = 4',
      }],
      ['q2', {
        isCorrect: false,
        score: 0,
        feedback: 'Incorrect. The sky is typically blue.',
      }],
    ]),
  };

  const handleRetake = () => {
    setShowResults(false);
    alert('Starting new attempt...');
  };

  return (
    <div className="example-container">
      <h1>Loaded Quiz Results Example</h1>
      <p>This demonstrates how to load and display previous quiz submissions.</p>

      {showResults ? (
        <Quiz config={quizConfig} loadedResult={loadedResult}>
          <QuizResults 
            onRetake={handleRetake}
            onClose={() => alert('Closed')}
          />
        </Quiz>
      ) : (
        <div>
          <p>Starting new attempt...</p>
          <button onClick={() => setShowResults(true)}>
            View Previous Results Again
          </button>
        </div>
      )}
    </div>
  );
}