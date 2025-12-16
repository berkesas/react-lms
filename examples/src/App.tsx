import { useState } from 'react';
import { AllQuestionsExample } from './BasicQuestionExamples';
import { AllQuizExamples } from './QuizExamples';
import { AllAdvancedExamples } from './AdvancedExamples';
import { LoadedResultsExample } from './LoadedResultsExample';
import { StorageExample } from './StorageExample';
import '../../src/styles/index.css';
import './App.css';

type View = 'home' | 'questions' | 'quizzes' | 'advanced' | 'results' | 'storage';

export function App() {
  const [currentView, setCurrentView] = useState<View>('home');

  const renderView = () => {
    switch (currentView) {
      case 'questions':
        return <AllQuestionsExample />;
      case 'quizzes':
        return <AllQuizExamples />;
      case 'advanced':
        return <AllAdvancedExamples />;
      case 'results':
        return <LoadedResultsExample />;
      case 'storage':
        return <StorageExample/>;
      default:
        return <HomePage setView={setCurrentView} />;
    }
  };

  return (
    <div className="app">
      <nav className="app-nav">
        <h1>Pico LMS Components Examples</h1>
        <div className="nav-buttons">
          <button onClick={() => setCurrentView('home')}>Home</button>
          <button onClick={() => setCurrentView('questions')}>Questions</button>
          <button onClick={() => setCurrentView('quizzes')}>Quizzes</button>
          <button onClick={() => setCurrentView('advanced')}>Advanced</button>
          <button onClick={() => setCurrentView('results')}>Results</button>
          <button onClick={() => setCurrentView('storage')}>Storage</button>
        </div>
      </nav>
      <main className="app-main">{renderView()}</main>
    </div>
  );
}

function HomePage({ setView }: { setView: (view: View) => void }) {
  return (
    <div className="home-page">
      <h1>Welcome to Pico LMS Components</h1>
      <p className="subtitle">
        A comprehensive library of React components for building learning
        management systems
      </p>

      <div className="feature-grid">
        <div className="feature-card" onClick={() => setView('questions')}>
          <h2>📝 Question Components</h2>
          <p>
            Multiple choice, true/false, short answer, essay, fill-in-blank, and
            matching questions
          </p>
          <button>View Examples →</button>
        </div>

        <div className="feature-card" onClick={() => setView('quizzes')}>
          <h2>📋 Quiz Components</h2>
          <p>
            Complete quiz system with navigation, progress tracking, and
            multiple submission modes
          </p>
          <button>View Examples →</button>
        </div>

        <div className="feature-card" onClick={() => setView('advanced')}>
          <h2>🚀 Advanced Features</h2>
          <p>Custom renderers, review mode, event callbacks, and more</p>
          <button>View Examples →</button>
        </div>
      </div>

      <div className="features-list">
        <h2>Key Features</h2>
        <ul>
          <li>✅ TypeScript support with full type definitions</li>
          <li>
            ✅ Flexible submission modes (question-level, quiz-level, hybrid)
          </li>
          <li>✅ Built-in validation and feedback systems</li>
          <li>✅ Timer support for timed assessments</li>
          <li>✅ Progress tracking and analytics</li>
          <li>✅ Fully accessible (WCAG 2.1 AA compliant)</li>
          <li>✅ Customizable styling with CSS variables</li>
          <li>✅ Dark mode support</li>
          <li>✅ Responsive and mobile-friendly</li>
        </ul>
      </div>

      <div className="quick-start">
        <h2>Quick Start</h2>
        <pre>
          <code>{`npm install @scinforma/picolms

import { MultipleChoice } from '@scinforma/picolms';
import '@scinforma/picolms/dist/styles/index.css';

function MyComponent() {
  const config = {
    id: 'q1',
    type: 'multiple-choice',
    question: 'What is React?',
    points: 10,
    options: [
      { id: '1', text: 'A library', isCorrect: true },
      { id: '2', text: 'A framework', isCorrect: false },
    ],
  };

  return <MultipleChoice config={config} />;
}`}</code>
        </pre>
      </div>
    </div>
  );
}
