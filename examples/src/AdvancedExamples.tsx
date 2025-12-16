import { useState } from 'react';
import {
  Quiz,
  QuizNavigation,
  QuizProgressBar,
  QuizReview,
  MultipleChoice,
  Essay,
} from '@lms-components/components';
import { useQuizContext } from '@lms-components/context';
import type { QuizConfig, QuizResult } from '@lms-components/types';

// Custom Question Renderer Example
export function CustomRendererExample() {
  const quizConfig: QuizConfig = {
    id: 'quiz-custom',
    title: 'Quiz with Custom Styling',
    submissionMode: 'quiz-level',
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'What is your favorite color?',
        points: 5,
        options: [
          { id: 'opt1', text: 'Red', isCorrect: true },
          { id: 'opt2', text: 'Blue', isCorrect: true },
          { id: 'opt3', text: 'Green', isCorrect: true },
        ],
        allowMultiple: false,
      },
    ],
    allowNavigation: true,
  };

  const customRenderQuestion = (question: any, index: number) => {
    return (
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        borderRadius: '1rem',
        color: 'white'
      }}>
        <h2 style={{ color: 'white' }}>Question {index + 1}</h2>
        <CustomQuestionContent question={question} />
      </div>
    );
  };

  return (
    <div className="example-container">
      <h1>Custom Question Renderer</h1>
      <Quiz config={quizConfig} renderQuestion={customRenderQuestion}>
        <QuizNavigation />
      </Quiz>
    </div>
  );
}

// Helper component for custom renderer
function CustomQuestionContent({ question }: { question: any }) {
  const { setAnswer } = useQuizContext();

  return (
    <MultipleChoice 
      config={question}
      onAnswerChange={(answer) => setAnswer(question.id, answer)}
    />
  );
}

// Quiz with Review Mode
export function QuizWithReviewExample() {
  const [showReview, setShowReview] = useState(false);
  
  const quizConfig: QuizConfig = {
    id: 'quiz-review',
    title: 'Quiz with Review',
    description: 'Review your answers before submitting',
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
        type: 'essay',
        question: 'Explain your answer to the previous question.',
        points: 10,
        minWords: 10,
      },
    ],
    allowNavigation: true,
    allowReview: true,
  };

  return (
    <div className="example-container">
      <h1>Quiz with Review Mode</h1>
      <Quiz config={quizConfig}>
        {showReview ? (
          <QuizReview 
            onEdit={() => setShowReview(false)}
            onSubmit={() => alert('Quiz submitted!')}
          />
        ) : (
          <>
            <QuizContent />
            <button 
              onClick={() => setShowReview(true)}
              style={{
                marginTop: '2rem',
                padding: '1rem 2rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
              }}
            >
              Review Answers Before Submitting
            </button>
          </>
        )}
      </Quiz>
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
        {currentQuestion.type === 'essay' && (
          <Essay 
            config={currentQuestion as any}
            onAnswerChange={(answer) => setAnswer(currentQuestion.id, answer)}
          />
        )}
      </div>
      <QuizNavigation />
    </>
  );
}

// Quiz with Callbacks
export function QuizWithCallbacksExample() {
  const [events, setEvents] = useState<string[]>([]);

  const addEvent = (event: string) => {
    setEvents(prev => [...prev, `${new Date().toLocaleTimeString()}: ${event}`]);
  };

  const quizConfig: QuizConfig = {
    id: 'quiz-callbacks',
    title: 'Quiz with Event Callbacks',
    submissionMode: 'quiz-level',
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Sample question',
        points: 10,
        options: [
          { id: 'opt1', text: 'Option 1', isCorrect: true },
          { id: 'opt2', text: 'Option 2', isCorrect: false },
        ],
        allowMultiple: false,
      },
    ],
    allowNavigation: true,
  };

  return (
    <div className="example-container">
      <h1>Quiz with Event Callbacks</h1>
      <Quiz 
        config={quizConfig}
        onAnswerChange={(questionId, answer) => {
          addEvent(`Answer changed for ${questionId}: ${JSON.stringify(answer.value)}`);
        }}
        onProgressChange={(progress) => {
          addEvent(`Progress: ${progress.answeredQuestions}/${progress.totalQuestions} answered`);
        }}
        onQuizSubmit={(result: QuizResult) => {
          addEvent(`Quiz submitted! Score: ${result.score}/${result.maxScore}`);
        }}
      >
        <CallbacksQuizContent />
      </Quiz>
      
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#f3f4f6',
        borderRadius: '0.5rem',
        maxHeight: '300px',
        overflow: 'auto',
      }}>
        <h3>Event Log:</h3>
        {events.map((event, index) => (
          <div key={index} style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            {event}
          </div>
        ))}
      </div>
    </div>
  );
}

function CallbacksQuizContent() {
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
      <QuizNavigation />
    </>
  );
}

export function AllAdvancedExamples() {
  return (
    <div className="all-examples">
      <CustomRendererExample />
      <hr style={{ margin: '4rem 0' }} />
      
      <QuizWithReviewExample />
      <hr style={{ margin: '4rem 0' }} />
      
      <QuizWithCallbacksExample />
    </div>
  );
}