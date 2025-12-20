# @scinforma/picolms

A lightweight React component library for building learning management systems with full TypeScript support.

## Demo page

[https://berkesas.github.io/picolms/](https://berkesas.github.io/picolms/)

[![npm version](https://badge.fury.io/js/@scinforma%2Fpicolms.svg)](https://www.npmjs.com/package/@scinforma/picolms)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Rich Question Types** - Multiple choice, true/false, short answer, essay, fill-in-blank, and matching questions
- **Complete Quiz System** - Full-featured quiz management with navigation, progress tracking, and review
- **Flexible Submission Modes** - Question-level, quiz-level, or hybrid submission
- **Automatic Grading** - Built-in grading engine for objective questions
- **Storage Support** - Save results to localStorage or your backend API
- **Auto-Save** - Configurable auto-save with intelligent debouncing
- **TypeScript First** - Complete type definitions included
- **Accessible** - WCAG 2.1 AA compliant components
- **Themeable** - Easy customization with CSS variables
- **Responsive** - Mobile-friendly out of the box
- **Lightweight** - Tree-shakeable with zero runtime dependencies

## Installation
```bash
npm install @scinforma/picolms
```

or with yarn:
```bash
yarn add @scinforma/picolms
```

or with pnpm:
```bash
pnpm add @scinforma/picolms
```

### Peer Dependencies

This package requires React 18 or higher:
```bash
npm install react react-dom
```

## Quick Start

### Basic Question
```tsx
import { MultipleChoice } from '@scinforma/picolms';
import "@scinforma/picolms/styles.css";

function MyQuestion() {
  const config = {
    id: 'q1',
    type: 'multiple-choice',
    question: 'What is the capital of France?',
    points: 10,
    options: [
      { id: '1', text: 'London', isCorrect: false },
      { id: '2', text: 'Paris', isCorrect: true },
      { id: '3', text: 'Berlin', isCorrect: false },
      { id: '4', text: 'Madrid', isCorrect: false },
    ],
    allowMultiple: false,
  };

  return (
    <MultipleChoice 
      config={config}
      onAnswerChange={(answer) => console.log(answer)}
      showFeedback={true}
    />
  );
}
```

### Complete Quiz
```tsx
import { 
  Quiz, 
  QuizNavigation, 
  QuizProgressBar,
  MultipleChoice,
  ShortAnswer
} from '@scinforma/picolms';
import { useQuizContext } from '@scinforma/picolms';

function MyQuiz() {
  const quizConfig = {
    id: 'quiz-1',
    title: 'React Fundamentals Quiz',
    description: 'Test your React knowledge',
    submissionMode: 'quiz-level',
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'What is JSX?',
        points: 10,
        options: [
          { id: '1', text: 'JavaScript XML', isCorrect: true },
          { id: '2', text: 'Java Syntax Extension', isCorrect: false },
        ],
        allowMultiple: false,
      },
      {
        id: 'q2',
        type: 'short-answer',
        question: 'What hook manages state?',
        points: 5,
        correctAnswers: ['useState'],
        caseSensitive: false,
      },
    ],
    allowNavigation: true,
    passingScore: 70,
    showScore: true,
    showCorrectAnswers: true,
  };

  return (
    <Quiz 
      config={quizConfig}
      onQuizSubmit={(result) => {
        console.log('Quiz completed!');
        console.log('Score:', result.score, '/', result.maxScore);
        console.log('Passed:', result.isPassed);
      }}
    >
      <QuizContent />
    </Quiz>
  );
}

function QuizContent() {
  const { currentQuestion, setAnswer } = useQuizContext();
  
  if (!currentQuestion) return null;

  return (
    <>
      <QuizProgressBar />
      <div>
        {currentQuestion.type === 'multiple-choice' && (
          <MultipleChoice 
            config={currentQuestion}
            onAnswerChange={(answer) => setAnswer(currentQuestion.id, answer)}
          />
        )}
        {currentQuestion.type === 'short-answer' && (
          <ShortAnswer 
            config={currentQuestion}
            onAnswerChange={(answer) => setAnswer(currentQuestion.id, answer)}
          />
        )}
      </div>
      <QuizNavigation showQuestionList />
    </>
  );
}
```

## Available Components

### Question Components

| Component | Description | Features |
|-----------|-------------|----------|
| `MultipleChoice` | Single or multi-select questions | Randomization, media support, min/max selections |
| `TrueOrFalse` | True/false questions | Three display modes (radio, buttons, toggle) |
| `ShortAnswer` | Text input questions | Validation, character limits, pattern matching |
| `Essay` | Long-form text answers | Word/character counting, rich text support |
| `FillInBlank` | Inline fill-in-the-blank | Multiple blanks, case sensitivity options |
| `Matching` | Match pairs of items | Randomization, media support |

### Quiz Components

| Component | Description |
|-----------|-------------|
| `Quiz` | Main quiz container with state management |
| `QuizNavigation` | Navigation controls with question list |
| `QuizProgressBar` | Visual progress indicator |
| `QuizReview` | Review answers before final submission |
| `QuizResults` | Display graded results with feedback |

## Storage and Auto-Save

### LocalStorage
```tsx
import { createLocalStorageManager } from '@scinforma/picolms';

const storage = createLocalStorageManager('user-123');

<Quiz 
  config={quizConfig}
  storageManager={storage}
  autoSaveInterval={2000}  // Auto-save every 2 seconds (0 = disabled)
  onQuizSubmit={(result) => console.log(result)}
/>
```

### Backend API
```tsx
import { createApiStorageManager } from '@scinforma/picolms';

const storage = createApiStorageManager(
  'https://api.yourapp.com',
  'user-123',
  'your-api-key'
);

<Quiz 
  config={quizConfig}
  storageManager={storage}
  autoSaveInterval={5000}
/>
```

### Custom API Endpoints
```tsx
import { ApiQuizAdapter, QuizStorageManager } from '@scinforma/picolms';

const adapter = new ApiQuizAdapter({
  baseUrl: 'https://api.yourapp.com',
  userId: 'user-123',
  apiKey: 'your-key',
  endpoints: {
    save: '/v1/quiz/save',
    load: '/v1/quiz/load',
    loadAll: '/v1/quiz/list',
    delete: '/v1/quiz/delete',
  },
});

const storage = new QuizStorageManager({ adapter, userId: 'user-123' });
```

## Theming

Customize the appearance with CSS variables:
```css
:root {
  /* Primary Colors */
  --picolms-color-primary: #your-color;
  --picolms-color-success: #your-success;
  --picolms-color-error: #your-error;
  
  /* Typography */
  --picolms-font-family: 'Inter', sans-serif;
  --picolms-font-size-base: 16px;
  
  /* Spacing */
  --picolms-spacing-md: 1rem;
  --picolms-spacing-lg: 1.5rem;
  
  /* Border Radius */
  --picolms-radius-md: 0.5rem;
}
```

### Dark Mode
```tsx
<div data-theme="dark">
  <Quiz config={quizConfig} />
</div>
```

### Component-Specific Styling

All components use the `picolms-` prefix for easy targeting:
```css
/* Customize multiple choice options */
.picolms-mc-option {
  border: 3px solid #custom-color;
  border-radius: 1rem;
}

.picolms-mc-option:hover {
  background: #custom-hover;
}

/* Customize quiz container */
.picolms-quiz-container {
  max-width: 900px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* Customize navigation buttons */
.picolms-quiz-nav-button {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

/* Customize progress bar */
.picolms-quiz-progress-fill {
  background: linear-gradient(90deg, #custom-start, #custom-end);
}
```

### Available Class Names

All components use prefixed class names for easy customization:

**Question Components:**
- `.picolms-base-question`
- `.picolms-question-header`, `.picolms-question-text`
- `.picolms-mc-option`, `.picolms-mc-option-selected`
- `.picolms-tf-button`, `.picolms-tf-toggle`
- `.picolms-sa-input`, `.picolms-essay-textarea`
- `.picolms-fib-blank`, `.picolms-matching-container`

**Quiz Components:**
- `.picolms-quiz-container`
- `.picolms-quiz-progress-bar`, `.picolms-quiz-progress-fill`
- `.picolms-quiz-nav-button`, `.picolms-quiz-question-list`
- `.picolms-quiz-results`, `.picolms-result-question`

## Usage Examples

### Question-Level Submission

Each question is submitted individually with immediate feedback:
```tsx
const config = {
  id: 'quiz-1',
  submissionMode: 'question-level',
  questions: [/* ... */],
  showFeedbackOnSubmit: true,
};
```

### Quiz-Level Submission

All questions submitted together at the end:
```tsx
const config = {
  id: 'quiz-2',
  submissionMode: 'quiz-level',
  questions: [/* ... */],
  requireAllAnswered: true,
  allowReview: true,
};
```

### Timed Quiz
```tsx
const config = {
  id: 'quiz-3',
  timeLimit: 300,  // 5 minutes in seconds
  showTimer: true,
  questions: [/* ... */],
};
```

### Linear Quiz (No Back Navigation)
```tsx
const config = {
  id: 'quiz-4',
  allowNavigation: false,
  allowSkip: false,
  questions: [/* ... */],
};
```

## TypeScript Support

Full TypeScript definitions are included:
```tsx
import type { 
  QuizConfig,
  QuestionConfig,
  MultipleChoiceConfig,
  TrueFalseConfig,
  ShortAnswerConfig,
  EssayConfig,
  QuizResult,
  QuestionAnswer,
  LoadedQuizResult
} from '@scinforma/picolms';

const config: MultipleChoiceConfig = {
  id: 'q1',
  type: 'multiple-choice',
  question: 'Sample question',
  points: 10,
  options: [/* ... */],
};

const handleSubmit = (result: QuizResult) => {
  console.log(result.score, result.isPassed);
};
```

## Advanced Features

### Custom Question Renderer
```tsx
<Quiz 
  config={quizConfig}
  renderQuestion={(question, index) => (
    <div style={{ background: 'lightblue', padding: '2rem' }}>
      <h2>Custom Question {index + 1}</h2>
      <MultipleChoice config={question} />
    </div>
  )}
/>
```

### Event Callbacks
```tsx
<Quiz 
  config={quizConfig}
  onAnswerChange={(questionId, answer) => {
    console.log('Answer changed:', questionId, answer);
  }}
  onProgressChange={(progress) => {
    console.log('Progress:', progress.percentComplete);
  }}
  onQuizSubmit={(result) => {
    console.log('Submitted:', result);
  }}
/>
```

### Load Previous Results
```tsx
import { useQuizStorage, createLocalStorageManager } from '@scinforma/picolms';

const storage = createLocalStorageManager('user-123');

function MyQuiz() {
  const { latestResult, statistics } = useQuizStorage({
    storageManager: storage,
    quizId: 'quiz-1',
    autoLoad: true,
  });

  return (
    <div>
      <p>Best Score: {statistics.bestScore}</p>
      <p>Total Attempts: {statistics.totalAttempts}</p>
      
      {latestResult && (
        <Quiz config={quizConfig} loadedResult={latestResult}>
          <QuizResults onRetake={() => window.location.reload()} />
        </Quiz>
      )}
    </div>
  );
}
```

## Question Configuration Examples

### Multiple Choice
```tsx
{
  id: 'mc-1',
  type: 'multiple-choice',
  question: 'Select the correct answer',
  points: 10,
  options: [
    { id: '1', text: 'Option 1', isCorrect: true },
    { id: '2', text: 'Option 2', isCorrect: false },
  ],
  allowMultiple: false,  // or true for multi-select
  shuffleOptions: true,
  feedback: {
    correct: { type: 'correct', message: 'Well done!' },
    incorrect: { type: 'incorrect', message: 'Try again!' },
    hints: ['Think carefully', 'Consider all options'],
  },
}
```

### Short Answer
```tsx
{
  id: 'sa-1',
  type: 'short-answer',
  question: 'What is H2O?',
  points: 5,
  correctAnswers: ['water', 'Water'],
  caseSensitive: false,
  trimWhitespace: true,
  maxLength: 50,
  placeholder: 'Type your answer...',
  validation: {
    rules: [
      { type: 'required', message: 'Answer required' },
      { type: 'maxLength', value: 50, message: 'Too long' },
    ],
  },
}
```

### Essay
```tsx
{
  id: 'essay-1',
  type: 'essay',
  question: 'Explain the concept...',
  points: 50,
  minWords: 100,
  maxWords: 500,
  minCharacters: 500,
  placeholder: 'Write your essay here...',
}
```

### Fill in the Blank
```tsx
{
  id: 'fib-1',
  type: 'fill-in-blank',
  question: 'Complete the sentence',
  points: 15,
  segments: [
    { type: 'text', content: 'The ' },
    { type: 'blank', id: 'b1', correctAnswers: ['quick'], placeholder: '___' },
    { type: 'text', content: ' brown fox.' },
  ],
}
```

### Matching
```tsx
{
  id: 'match-1',
  type: 'matching',
  question: 'Match countries with capitals',
  points: 20,
  pairs: [
    { id: 'p1', left: 'France', right: 'Paris' },
    { id: 'p2', left: 'Japan', right: 'Tokyo' },
  ],
  randomizeLeft: false,
  randomizeRight: true,
}
```

## Quiz Configuration
```tsx
const quizConfig: QuizConfig = {
  id: 'quiz-1',
  title: 'My Quiz',
  description: 'Quiz description',
  instructions: 'Answer all questions',
  
  // Submission
  submissionMode: 'quiz-level',  // 'question-level' | 'quiz-level' | 'hybrid'
  requireAllAnswered: true,
  allowReview: true,
  
  // Navigation
  allowNavigation: true,
  allowSkip: false,
  shuffleQuestions: false,
  
  // Timing
  timeLimit: 300,  // seconds
  showTimer: true,
  
  // Scoring
  passingScore: 70,  // percentage
  showScore: true,
  showCorrectAnswers: true,
  
  questions: [/* question configs */],
};
```

## Hooks

### useQuizContext

Access quiz state from any child component:
```tsx
import { useQuizContext } from '@scinforma/picolms';

function CustomComponent() {
  const { 
    currentQuestion, 
    setAnswer, 
    progress, 
    submitQuiz 
  } = useQuizContext();
  
  return <div>Question {progress.currentQuestionIndex + 1}</div>;
}
```

### useQuizStorage

Manage quiz result storage:
```tsx
import { useQuizStorage, createLocalStorageManager } from '@scinforma/picolms';

const storage = createLocalStorageManager('user-id');

function MyComponent() {
  const {
    latestResult,
    allAttempts,
    statistics,
    saveResult,
    loadLatest,
    clearAll,
  } = useQuizStorage({
    storageManager: storage,
    quizId: 'quiz-1',
    autoLoad: true,
  });

  return (
    <div>
      <p>Best Score: {statistics.bestScore}</p>
      <p>Attempts: {statistics.totalAttempts}</p>
    </div>
  );
}
```

## Utilities

### Grading
```tsx
import { gradeQuestion, gradeQuiz } from '@scinforma/picolms';

// Grade a single question
const result = gradeQuestion(questionConfig, answer);
console.log(result.isCorrect, result.score);

// Grade entire quiz
const quizResult = gradeQuiz({ questions }, answersMap);
console.log(quizResult.totalScore, quizResult.percentage);
```

## Styling

### Import Styles
```tsx
import "@scinforma/picolms/styles.css";
```

### Custom Theme

Customize the appearance with CSS variables:
```css
:root {
  /* Primary Colors */
  --picolms-color-primary: #your-color;
  --picolms-color-success: #your-success;
  --picolms-color-error: #your-error;
  
  /* Typography */
  --picolms-font-family: 'Inter', sans-serif;
  --picolms-font-size-base: 16px;
  
  /* Spacing */
  --picolms-spacing-md: 1rem;
  --picolms-spacing-lg: 1.5rem;
  
  /* Border Radius */
  --picolms-radius-md: 0.5rem;
}
```

### Dark Mode
```tsx
<div data-theme="dark">
  <Quiz config={quizConfig} />
</div>
```

### Component-Specific Styling

All components use the `picolms-` prefix for easy targeting:
```css
/* Customize multiple choice options */
.picolms-mc-option {
  border: 3px solid #custom-color;
  border-radius: 1rem;
}

.picolms-mc-option:hover {
  background: #custom-hover;
}

/* Customize quiz container */
.picolms-quiz-container {
  max-width: 900px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* Customize navigation buttons */
.picolms-quiz-nav-button {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

/* Customize progress bar */
.picolms-quiz-progress-fill {
  background: linear-gradient(90deg, #custom-start, #custom-end);
}
```

### Available Class Names

All components use prefixed class names for easy customization:

**Question Components:**
- `.picolms-base-question`
- `.picolms-question-header`, `.picolms-question-text`
- `.picolms-mc-option`, `.picolms-mc-option-selected`
- `.picolms-tf-button`, `.picolms-tf-toggle`
- `.picolms-sa-input`, `.picolms-essay-textarea`
- `.picolms-fib-blank`, `.picolms-matching-container`

**Quiz Components:**
- `.picolms-quiz-container`
- `.picolms-quiz-progress-bar`, `.picolms-quiz-progress-fill`
- `.picolms-quiz-nav-button`, `.picolms-quiz-question-list`
- `.picolms-quiz-results`, `.picolms-result-question`

## Usage Examples

### Question-Level Submission

Each question is submitted individually with immediate feedback:
```tsx
const config = {
  id: 'quiz-1',
  submissionMode: 'question-level',
  questions: [/* ... */],
  showFeedbackOnSubmit: true,
};
```

### Quiz-Level Submission

All questions submitted together at the end:
```tsx
const config = {
  id: 'quiz-2',
  submissionMode: 'quiz-level',
  questions: [/* ... */],
  requireAllAnswered: true,
  allowReview: true,
};
```

### Timed Quiz
```tsx
const config = {
  id: 'quiz-3',
  timeLimit: 300,  // 5 minutes in seconds
  showTimer: true,
  questions: [/* ... */],
};
```

### Linear Quiz (No Back Navigation)
```tsx
const config = {
  id: 'quiz-4',
  allowNavigation: false,
  allowSkip: false,
  questions: [/* ... */],
};
```

### Auto-Save Configuration
```tsx
<Quiz 
  config={quizConfig}
  storageManager={storage}
  autoSaveInterval={0}      // Disabled
/>

<Quiz 
  config={quizConfig}
  storageManager={storage}
  autoSaveInterval={2000}   // Every 2 seconds
/>

<Quiz 
  config={quizConfig}
  storageManager={storage}
  autoSaveInterval={30000}  // Every 30 seconds
/>
```

## TypeScript Support

Full TypeScript definitions are included:
```tsx
import type { 
  QuizConfig,
  QuestionConfig,
  MultipleChoiceConfig,
  TrueFalseConfig,
  ShortAnswerConfig,
  EssayConfig,
  QuizResult,
  QuestionAnswer,
  LoadedQuizResult
} from '@scinforma/picolms';

const config: MultipleChoiceConfig = {
  id: 'q1',
  type: 'multiple-choice',
  question: 'Sample question',
  points: 10,
  options: [/* ... */],
};

const handleSubmit = (result: QuizResult) => {
  console.log(result.score, result.isPassed);
};
```

## Advanced Features

### Custom Question Renderer
```tsx
<Quiz 
  config={quizConfig}
  renderQuestion={(question, index) => (
    <div className="my-custom-wrapper">
      <h2>Question {index + 1}</h2>
      <MultipleChoice config={question} />
    </div>
  )}
/>
```

### Event Callbacks
```tsx
<Quiz 
  config={quizConfig}
  onAnswerChange={(questionId, answer) => {
    console.log('Answer changed:', questionId, answer);
  }}
  onProgressChange={(progress) => {
    console.log('Progress:', progress.percentComplete);
  }}
  onQuizSubmit={(result) => {
    console.log('Submitted:', result);
  }}
/>
```

### Load Previous Results
```tsx
import { useQuizStorage, createLocalStorageManager } from '@scinforma/picolms';

const storage = createLocalStorageManager('user-123');

function MyQuiz() {
  const { latestResult, statistics } = useQuizStorage({
    storageManager: storage,
    quizId: 'quiz-1',
    autoLoad: true,
  });

  return (
    <div>
      <p>Best Score: {statistics.bestScore}</p>
      <p>Total Attempts: {statistics.totalAttempts}</p>
      
      {latestResult && (
        <Quiz config={quizConfig} loadedResult={latestResult}>
          <QuizResults onRetake={() => window.location.reload()} />
        </Quiz>
      )}
    </div>
  );
}
```

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Issues

Found a bug? Have a feature request? Please open an issue on [GitHub](https://github.com/berkesas/picolms/issues).

## Support

- GitHub Issues: https://github.com/berkesas/picolms/issues
- Documentation: https://github.com/berkesas/picolms#readme

## Acknowledgments

Built with React, TypeScript, and Rollup

## Copyright

Copyright (c) 2024-2026 Nazar Mammedov