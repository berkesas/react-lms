import { useState } from 'react';
import { AllQuestionsExample } from './BasicQuestionExamples';
import { AllQuizExamples } from './QuizExamples';
import { AllAdvancedExamples } from './AdvancedExamples';
import { LoadedResultsExample } from './LoadedResultsExample';
import { StorageExample } from './StorageExample';
import {
  LoadQuizFromJsonExample,
  DynamicQuizLoaderExample,
} from './LoadQuizFromJsonExample';
import { TailwindStyledQuizExample } from './TailwindStyledQuizExample';
import { MarkdownExamples } from './MarkdownExamples';
import '../../src/styles/index.css';
import './App.css';

type View =
  | 'home'
  | 'questions'
  | 'quizzes'
  | 'advanced'
  | 'results'
  | 'storage'
  | 'fromjson'
  | 'tailwind'
  | 'markdown';

export function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleViewChange = (view: View) => {
    setCurrentView(view);
    setMobileMenuOpen(false); // Close mobile menu when view changes
  };

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
        return <StorageExample />;
      case 'fromjson':
        return (
          <>
            <LoadQuizFromJsonExample />
            <DynamicQuizLoaderExample />
          </>
        );
      case 'tailwind':
        return <TailwindStyledQuizExample />;
      case 'markdown':
        return <MarkdownExamples />;
      default:
        return <HomePage setView={handleViewChange} />;
    }
  };

  return (
    <div className="app">
      <nav className="app-nav">
        <div className="nav-container">
          <h1 className="nav-title">Pico LMS Components</h1>

          {/* Mobile Menu Toggle Button */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg
                className="menu-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="menu-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>

          {/* Navigation Buttons */}
          <div className={`nav-buttons ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <button
              className={currentView === 'home' ? 'active' : ''}
              onClick={() => handleViewChange('home')}
            >
              Home
            </button>
            <button
              className={currentView === 'questions' ? 'active' : ''}
              onClick={() => handleViewChange('questions')}
            >
              Questions
            </button>
            <button
              className={currentView === 'quizzes' ? 'active' : ''}
              onClick={() => handleViewChange('quizzes')}
            >
              Quizzes
            </button>
            <button
              className={currentView === 'advanced' ? 'active' : ''}
              onClick={() => handleViewChange('advanced')}
            >
              Advanced
            </button>
            <button
              className={currentView === 'results' ? 'active' : ''}
              onClick={() => handleViewChange('results')}
            >
              Results
            </button>
            <button
              className={currentView === 'storage' ? 'active' : ''}
              onClick={() => handleViewChange('storage')}
            >
              Storage
            </button>
            <button
              className={currentView === 'fromjson' ? 'active' : ''}
              onClick={() => handleViewChange('fromjson')}
            >
              Json Load
            </button>
            <button
              className={currentView === 'tailwind' ? 'active' : ''}
              onClick={() => handleViewChange('tailwind')}
            >
              Tailwind
            </button>
            <button
              className={currentView === 'markdown' ? 'active' : ''}
              onClick={() => handleViewChange('markdown')}
            >
              Markdown
            </button>
          </div>
        </div>
      </nav>
      <main className="app-main">{renderView()}</main>
    </div>
  );
}

function HomePage({ setView }: { setView: (view: View) => void }) {
  return (
    <div className="home-page">
      <div className="home-header">
        <h1>Welcome to Pico LMS Components</h1>
        <p className="subtitle">
          A lightweight library of React components for building learning
          management systems
        </p>
      </div>

      <div className="feature-grid">
        <div className="feature-card" onClick={() => setView('questions')}>
          <div className="feature-icon">📝</div>
          <h2>Question Components</h2>
          <p>
            Multiple choice, true/false, short answer, essay, fill-in-blank, and
            matching questions
          </p>
          <button className="feature-button">View Examples →</button>
        </div>

        <div className="feature-card" onClick={() => setView('quizzes')}>
          <div className="feature-icon">📋</div>
          <h2>Quiz Components</h2>
          <p>
            Complete quiz system with navigation, progress tracking, and
            multiple submission modes
          </p>
          <button className="feature-button">View Examples →</button>
        </div>

        <div className="feature-card" onClick={() => setView('advanced')}>
          <div className="feature-icon">🚀</div>
          <h2>Advanced Features</h2>
          <p>Custom renderers, review mode, event callbacks, and more</p>
          <button className="feature-button">View Examples →</button>
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
        <div className="code-container">
          <pre>
            <code>{`npm install @scinforma/picolms

import { MultipleChoice } from '@scinforma/picolms';
import '@scinforma/picolms/styles.css';

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
      <div style={{ marginTop: '10px' }}>&copy; 2024-2026 Nazar Mammedov</div>
    </div>
  );
}
