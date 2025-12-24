import { useState } from 'react';
import {
  MultipleChoice,
  TrueOrFalse,
  ShortAnswer,
  Essay,
  FillInBlank,
  Matching,
} from '@lms-components/components/questions';
import type {
  MultipleChoiceConfig,
  TrueOrFalseConfig,
  ShortAnswerConfig,
  EssayConfig,
  FillInBlankConfig,
  MatchingConfig,
  QuestionAnswer,
} from '@lms-components/types';

export function MultipleChoiceExample() {
  const config: MultipleChoiceConfig = {
    id: 'mc-1',
    type: 'multiple-choice',
    question: 'What is the capital of France?',
    instructions: 'Select the correct answer',
    points: 10,
    difficulty: 'beginner',
    options: [
      { id: 'opt1', text: 'London', isCorrect: false },
      {
        id: 'opt2',
        text: 'Paris',
        isCorrect: true,
        feedback: 'Correct! Paris is the capital of France.',
      },
      { id: 'opt3', text: 'Berlin', isCorrect: false },
      { id: 'opt4', text: 'Madrid', isCorrect: false },
    ],
    allowMultiple: false,
    shuffleOptions: false,
    feedback: {
      correct: {
        type: 'correct',
        message: 'Great job! You got it right!',
        showAfter: 'immediate',
      },
      incorrect: {
        type: 'incorrect',
        message: 'Not quite. Try again!',
        showAfter: 'immediate',
      },
      hints: ['Think about French culture', "It's known for the Eiffel Tower"],
    },
  };

  const [answer, setAnswer] = useState<QuestionAnswer<string>>();

  return (
    <div className="example-container">
      <h2>Multiple Choice Example</h2>
      <MultipleChoice
        config={config}
        onAnswerChange={(ans) => setAnswer(ans)}
        showFeedback={true}
      />
      <div className="example-output">
        <h3>Current Answer:</h3>
        <pre>{JSON.stringify(answer?.value, null, 2)}</pre>
        <h3>Is Answered:</h3>
        <pre>{answer?.isAnswered ? 'Yes' : 'No'}</pre>
      </div>
    </div>
  );
}

export function MultiSelectExample() {
  const config: MultipleChoiceConfig = {
    id: 'mc-2',
    type: 'multiple-choice',
    question:
      'Which of the following are programming languages? (Select all that apply)',
    instructions: 'Select all correct answers',
    points: 20,
    options: [
      { id: 'opt1', text: 'Python', isCorrect: true },
      { id: 'opt2', text: 'HTML', isCorrect: false },
      { id: 'opt3', text: 'JavaScript', isCorrect: true },
      { id: 'opt4', text: 'CSS', isCorrect: false },
      { id: 'opt5', text: 'Java', isCorrect: true },
    ],
    allowMultiple: true,
    minSelections: 1,
    maxSelections: 5,
  };

  const [answer, setAnswer] = useState<QuestionAnswer<string[]>>();

  return (
    <div className="example-container">
      <h2>Multi-Select Example</h2>
      <MultipleChoice
        config={config}
        onAnswerChange={(ans) => setAnswer(ans)}
      />
      <div className="example-output">
        <h3>Current Answer:</h3>
        <pre>{JSON.stringify(answer?.value, null, 2)}</pre>
        <h3>Is Answered:</h3>
        <pre>{answer?.isAnswered ? 'Yes' : 'No'}</pre>
      </div>
    </div>
  );
}

export function TrueOrFalseExample() {
  const config: TrueOrFalseConfig = {
    id: 'tf-1',
    type: 'true-false',
    question: 'The Earth is flat.',
    points: 5,
    correctAnswer: false,
    maxAttempts: 3,
    displayAs: 'buttons',
    feedback: {
      correct: {
        type: 'correct',
        message: 'Correct! The Earth is round.',
      },
      incorrect: {
        type: 'incorrect',
        message: 'Incorrect. The Earth is actually round.',
      },
    },
  };

  const [answer, setAnswer] = useState<QuestionAnswer<boolean>>();

  return (
    <div className="example-container">
      <h2>True/False Example</h2>
      <TrueOrFalse
        config={config}
        answer={answer}
        onAnswerChange={(ans) => setAnswer(ans)}
        showFeedback={true}
        showCheckButton={true}
      />
      <div className="example-output">
        <h3>Current Answer:</h3>
        <pre>{JSON.stringify(answer?.value, null, 2)}</pre>
        <h3>Is Answered:</h3>
        <pre>{answer?.isAnswered ? 'Yes' : 'No'}</pre>
      </div>
    </div>
  );
}

export function ShortAnswerExample() {
  const config: ShortAnswerConfig = {
    id: 'sa-1',
    type: 'short-answer',
    question: 'What is the chemical symbol for water?',
    instructions: 'Enter your answer in the text box below',
    points: 0,
    correctAnswers: ['H2O', 'h2o'],
    caseSensitive: false,
    trimWhitespace: true,
    maxLength: 10,
    maxAttempts: 3,
    placeholder: 'Enter your answer...',
    validation: {
      rules: [
        {
          type: 'required',
          message: 'Please provide an answer',
        },
        {
          type: 'maxLength',
          value: 10,
          message: 'Answer must be 10 characters or less',
        },
      ],
    },
    feedback: {
      correct: {
        type: 'correct',
        message: 'Correct! H2O is the chemical symbol for water.',
      },
      incorrect: {
        type: 'incorrect',
        message: 'Incorrect. The correct answer is H2O or h2o.',
      },
    },
  };

  const [answer, setAnswer] = useState<QuestionAnswer<string>>();

  return (
    <div className="example-container">
      <h2>Short Answer Example</h2>
      <ShortAnswer
        config={config}
        onAnswerChange={(ans) => setAnswer(ans)}
        showCheckButton={true}
        showFeedback={true}
      />
      <div className="example-output">
        <h3>Current Answer:</h3>
        <pre>{JSON.stringify(answer?.value, null, 2)}</pre>
        <h3>Is Answered:</h3>
        <pre>{answer?.isAnswered ? 'Yes' : 'No'}</pre>
      </div>
    </div>
  );
}

export function EssayExample() {
  const config: EssayConfig = {
    id: 'essay-1',
    type: 'essay',
    question:
      'Describe the importance of renewable energy in combating climate change.',
    instructions: 'Write a detailed essay (minimum 100 words)',
    points: 50,
    minWords: 100,
    maxWords: 500,
    placeholder: 'Start typing your essay here...',
  };

  const [answer, setAnswer] = useState<QuestionAnswer<string>>();

  return (
    <div className="example-container">
      <h2>Essay Example</h2>
      <Essay config={config} onAnswerChange={(ans) => setAnswer(ans)} />
      <div className="example-output">
        <h3>Current Answer Length:</h3>
        <pre>{answer?.value?.length || 0} characters</pre>
        <h3>Is Answered:</h3>
        <pre>{answer?.isAnswered ? 'Yes' : 'No'}</pre>
      </div>
    </div>
  );
}

export function FillInBlankExample() {
  const config: FillInBlankConfig = {
    id: 'fib-1',
    type: 'fill-in-blank',
    question: 'Complete the sentence',
    instructions: 'Fill in the blanks with the correct words',
    points: 15,
    segments: [
      { type: 'text', content: 'The ' },
      {
        type: 'blank',
        id: 'blank1',
        correctAnswers: ['quick', 'fast'],
        placeholder: '___',
      },
      { type: 'text', content: ' brown ' },
      {
        type: 'blank',
        id: 'blank2',
        correctAnswers: ['fox'],
        placeholder: '___',
      },
      { type: 'text', content: ' jumps over the lazy ' },
      {
        type: 'blank',
        id: 'blank3',
        correctAnswers: ['dog'],
        placeholder: '___',
      },
      { type: 'text', content: '.' },
    ],
  };

  const [answer, setAnswer] =
    useState<QuestionAnswer<Record<string, string>>>();

  return (
    <div className="example-container">
      <h2>Fill in the Blank Example</h2>
      <FillInBlank config={config} onAnswerChange={(ans) => setAnswer(ans)} />
      <div className="example-output">
        <h3>Current Answer:</h3>
        <pre>{JSON.stringify(answer?.value, null, 2)}</pre>
        <h3>Is Answered:</h3>
        <pre>{answer?.isAnswered ? 'Yes' : 'No'}</pre>
      </div>
    </div>
  );
}

export function MatchingExample() {
  const config: MatchingConfig = {
    id: 'match-1',
    type: 'matching',
    question: 'Match each country with its capital city',
    instructions: 'Select the correct capital for each country',
    points: 20,
    pairs: [
      { id: 'pair1', left: 'France', right: 'Paris' },
      { id: 'pair2', left: 'Japan', right: 'Tokyo' },
      { id: 'pair3', left: 'Brazil', right: 'Brasília' },
      { id: 'pair4', left: 'Australia', right: 'Canberra' },
    ],
    randomizeLeft: false,
    randomizeRight: true,
  };

  const [answer, setAnswer] =
    useState<QuestionAnswer<Record<string, string>>>();

  return (
    <div className="example-container">
      <h2>Matching Example</h2>
      <Matching config={config} onAnswerChange={(ans) => setAnswer(ans)} />
      <div className="example-output">
        <h3>Current Answer:</h3>
        <pre>{JSON.stringify(answer?.value, null, 2)}</pre>
        <h3>Is Answered:</h3>
        <pre>{answer?.isAnswered ? 'Yes' : 'No'}</pre>
      </div>
    </div>
  );
}

export function AllQuestionsExample() {
  return (
    <div className="all-examples">
      <h1>Question Components Examples</h1>

      <MultipleChoiceExample />
      <hr />

      <MultiSelectExample />
      <hr />

      <TrueOrFalseExample />
      <hr />

      <ShortAnswerExample />
      <hr />

      <EssayExample />
      <hr />

      <FillInBlankExample />
      <hr />

      <MatchingExample />
    </div>
  );
}
