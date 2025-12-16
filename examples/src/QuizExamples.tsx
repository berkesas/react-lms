import {
  Quiz,
  QuizNavigation,
  QuizProgressBar,
  MultipleChoice,
  TrueOrFalse,
  ShortAnswer,
} from '@lms-components/components';
import { useQuizContext } from '@lms-components/context';
import type { QuizConfig } from '@lms-components/types';

// Simple Quiz with Question-Level Submission
export function SimpleQuizExample() {
  const quizConfig: QuizConfig = {
    id: 'quiz-1',
    title: 'React Basics Quiz',
    description: 'Test your knowledge of React fundamentals',
    instructions: 'Answer each question to the best of your ability',
    submissionMode: 'question-level',
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'What is JSX?',
        points: 10,
        options: [
          { id: 'opt1', text: 'A syntax extension for JavaScript', isCorrect: true },
          { id: 'opt2', text: 'A new programming language', isCorrect: false },
          { id: 'opt3', text: 'A database query language', isCorrect: false },
          { id: 'opt4', text: 'A CSS preprocessor', isCorrect: false },
        ],
        allowMultiple: false,
      },
      {
        id: 'q2',
        type: 'true-false',
        question: 'React uses a virtual DOM to improve performance.',
        points: 5,
        correctAnswer: true,
      },
      {
        id: 'q3',
        type: 'short-answer',
        question: 'What hook is used to manage state in functional components?',
        points: 5,
        correctAnswers: ['useState', 'use state'],
        caseSensitive: false,
        trimWhitespace: true,
      },
    ],
    allowNavigation: true,
    showTimer: false,
  };

  const handleQuizSubmit = (result: any) => {
    console.log('Quiz submitted:', result);
    alert(`Quiz submitted! You answered ${result.answers.length} questions.`);
  };

  return (
    <div className="example-container">
      <h1>Simple Quiz Example</h1>
      <Quiz config={quizConfig} onQuizSubmit={handleQuizSubmit}>
        <QuizContent />
      </Quiz>
    </div>
  );
}

// Quiz Content Component
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

// Timed Quiz Example
export function TimedQuizExample() {
  const quizConfig: QuizConfig = {
    id: 'quiz-2',
    title: 'Timed Math Quiz',
    description: 'Complete this quiz in 5 minutes',
    submissionMode: 'quiz-level',
    questions: [
      {
        id: 'q1',
        type: 'short-answer',
        question: 'What is 15 + 27?',
        points: 10,
        correctAnswers: ['42'],
      },
      {
        id: 'q2',
        type: 'short-answer',
        question: 'What is 8 × 7?',
        points: 10,
        correctAnswers: ['56'],
      },
      {
        id: 'q3',
        type: 'short-answer',
        question: 'What is 100 ÷ 4?',
        points: 10,
        correctAnswers: ['25'],
      },
    ],
    timeLimit: 300, // 5 minutes in seconds
    showTimer: true,
    allowNavigation: true,
    requireAllAnswered: false,
  };

  return (
    <div className="example-container">
      <h1>Timed Quiz Example</h1>
      <Quiz config={quizConfig}>
        <QuizContent />
      </Quiz>
    </div>
  );
}

// Quiz with Required Answers
export function RequiredAnswersQuizExample() {
  const quizConfig: QuizConfig = {
    id: 'quiz-3',
    title: 'Final Exam',
    description: 'All questions must be answered',
    submissionMode: 'quiz-level',
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Which principle is NOT part of SOLID?',
        points: 20,
        options: [
          { id: 'opt1', text: 'Single Responsibility', isCorrect: false },
          { id: 'opt2', text: 'Open/Closed', isCorrect: false },
          { id: 'opt3', text: 'Data Encapsulation', isCorrect: true },
          { id: 'opt4', text: 'Liskov Substitution', isCorrect: false },
        ],
        allowMultiple: false,
      },
      {
        id: 'q2',
        type: 'true-false',
        question: 'Dependency Injection is a design pattern.',
        points: 10,
        correctAnswer: true,
      },
    ],
    allowNavigation: true,
    requireAllAnswered: true,
    allowReview: true,
  };

  return (
    <div className="example-container">
      <h1>Required Answers Quiz</h1>
      <p style={{ color: 'red' }}>⚠️ All questions must be answered before submission</p>
      <Quiz config={quizConfig}>
        <QuizContent />
      </Quiz>
    </div>
  );
}

// Linear Quiz (No Navigation)
export function LinearQuizExample() {
  const quizConfig: QuizConfig = {
    id: 'quiz-4',
    title: 'Linear Assessment',
    description: 'Answer questions in order, no going back',
    submissionMode: 'quiz-level',
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'What comes first in the software development lifecycle?',
        points: 10,
        options: [
          { id: 'opt1', text: 'Implementation', isCorrect: false },
          { id: 'opt2', text: 'Requirements Analysis', isCorrect: true },
          { id: 'opt3', text: 'Testing', isCorrect: false },
          { id: 'opt4', text: 'Deployment', isCorrect: false },
        ],
        allowMultiple: false,
      },
      {
        id: 'q2',
        type: 'short-answer',
        question: 'What does API stand for?',
        points: 5,
        correctAnswers: ['Application Programming Interface'],
        caseSensitive: false,
      },
    ],
    allowNavigation: false,
    allowSkip: false,
  };

  return (
    <div className="example-container">
      <h1>Linear Quiz (No Back Button)</h1>
      <Quiz config={quizConfig}>
        <QuizContent />
      </Quiz>
    </div>
  );
}

export function AllQuizExamples() {
  return (
    <div className="all-examples">
      <SimpleQuizExample />
      <hr style={{ margin: '4rem 0' }} />
      
      <TimedQuizExample />
      <hr style={{ margin: '4rem 0' }} />
      
      <RequiredAnswersQuizExample />
      <hr style={{ margin: '4rem 0' }} />
      
      <LinearQuizExample />
    </div>
  );
}