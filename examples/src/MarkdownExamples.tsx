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
  ContentRenderer,
} from '@lms-components/types';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

/**
 * Markdown content renderer for quiz questions
 * Supports: bold, italic, links, images, code, quotes, and more
 */
const markdownRenderer: ContentRenderer = (content, _context) => {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        // Style links
        a: ({ node, ...props }) => (
          <a
            className="text-blue-600 hover:text-blue-800 underline"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
        // Style code blocks
        code: ({ node, className, children, ...props }) => {
          // Detect inline vs block by checking for language class
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match;

          return isInline ? (
            <code className="..." {...props}>
              {children}
            </code>
          ) : (
            <code className={`... ${className || ''}`} {...props}>
              {children}
            </code>
          );
        },
        // Style blockquotes
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 border-blue-500 pl-4 italic text-gray-700 dark:text-gray-300 my-2"
            {...props}
          />
        ),
        // Style images
        img: ({ node, ...props }) => (
          <img className="max-w-full h-auto rounded-lg my-2" {...props} />
        ),
        // Style paragraphs
        p: ({ node, ...props }) => <p className="mb-2" {...props} />,
      }}
    >
      {content}
    </Markdown>
  );
};

export function MarkdownMultipleChoiceExample() {
  const config: MultipleChoiceConfig = {
    id: 'mc-md-1',
    type: 'multiple-choice',
    question: 'What does the **HTTP** status code `404` mean?',
    instructions:
      'Select the *correct* answer. Read more at [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404)',
    points: 10,
    difficulty: 'intermediate',
    options: [
      {
        id: 'opt1',
        text: '**Server Error** - The server encountered an error',
        isCorrect: false,
      },
      {
        id: 'opt2',
        text: '**Not Found** - The requested resource could not be found',
        isCorrect: true,
        feedback:
          'Correct! `404 Not Found` means the server cannot find the requested resource.',
      },
      {
        id: 'opt3',
        text: '*Forbidden* - Access is denied',
        isCorrect: false,
      },
      {
        id: 'opt4',
        text: '~~Success~~ - Request completed successfully',
        isCorrect: false,
      },
    ],
    allowMultiple: false,
    shuffleOptions: true,
    feedback: {
      hints: [
        'Think about what happens when you visit a **non-existent** webpage',
        'The number `404` is very commonly seen on the web',
      ],
    },
  };

  const [answer, setAnswer] = useState<QuestionAnswer<string>>();

  return (
    <div className="example-container">
      <h2>Markdown Multiple Choice Example</h2>
      <MultipleChoice
        config={config}
        renderContent={markdownRenderer}
        onAnswerChange={(ans) => setAnswer(ans)}
        showFeedback={true}
      />
      <div className="example-output">
        <h3>Current Answer:</h3>
        <pre>{JSON.stringify(answer?.value, null, 2)}</pre>
      </div>
    </div>
  );
}

export function MarkdownTrueOrFalseExample() {
  const config: TrueOrFalseConfig = {
    id: 'tf-md-1',
    type: 'true-false',
    question:
      'The `useState` hook in **React** can only be used in *functional* components.',
    instructions:
      'Consider the [React Hooks documentation](https://react.dev/reference/react/hooks)',
    points: 5,
    correctAnswer: true,
    displayAs: 'buttons',
    feedback: {
      correct: {
        type: 'correct',
        message:
          '✅ **Correct!** Hooks, including `useState`, can only be used in functional components.',
      },
      incorrect: {
        type: 'incorrect',
        message:
          '❌ **Incorrect.** Hooks are exclusive to functional components in React.',
      },
      hints: [
        'Remember that hooks were introduced to provide *state* and *lifecycle* features to **functional** components',
      ],
    },
  };

  const [answer, setAnswer] = useState<QuestionAnswer<boolean>>();

  return (
    <div className="example-container">
      <h2>Markdown True/False Example</h2>
      <TrueOrFalse
        config={config}
        renderContent={markdownRenderer}
        onAnswerChange={(ans) => setAnswer(ans)}
        showFeedback={true}
      />
      <div className="example-output">
        <h3>Current Answer:</h3>
        <pre>{JSON.stringify(answer?.value, null, 2)}</pre>
      </div>
    </div>
  );
}

export function MarkdownShortAnswerExample() {
  const config: ShortAnswerConfig = {
    id: 'sa-md-1',
    type: 'short-answer',
    question:
      'What **hook** is used to manage *state* in React functional components?',
    instructions: 'Type the exact name of the hook. Hint: it starts with `use`',
    points: 5,
    correctAnswers: ['useState', 'use state'],
    caseSensitive: false,
    trimWhitespace: true,
    maxLength: 20,
    placeholder: 'useXxxxx',
    feedback: {
      hints: [
        'The hook name follows the pattern: `use` + `State`',
        "It's one of the most **commonly** used React hooks",
      ],
    },
  };

  const [answer, setAnswer] = useState<QuestionAnswer<string>>();

  return (
    <div className="example-container">
      <h2>Markdown Short Answer Example</h2>
      <ShortAnswer
        config={config}
        renderContent={markdownRenderer}
        onAnswerChange={(ans) => setAnswer(ans)}
      />
      <div className="example-output">
        <h3>Current Answer:</h3>
        <pre>{JSON.stringify(answer?.value, null, 2)}</pre>
      </div>
    </div>
  );
}

export function MarkdownEssayExample() {
  const config: EssayConfig = {
    id: 'essay-md-1',
    type: 'essay',
    question:
      'Explain the differences between **SQL** and **NoSQL** databases.',
    instructions: `Write a comprehensive essay covering:
- Key *architectural* differences
- Use cases for each type
- Examples of popular databases

> **Note:** Your answer should be at least 200 words.`,
    points: 50,
    minWords: 200,
    maxWords: 500,
    placeholder: 'Begin your essay here...',
  };

  const [answer, setAnswer] = useState<QuestionAnswer<string>>();

  return (
    <div className="example-container">
      <h2>Markdown Essay Example</h2>
      <Essay
        config={config}
        renderContent={markdownRenderer}
        onAnswerChange={(ans) => setAnswer(ans)}
      />
      <div className="example-output">
        <h3>Current Answer Length:</h3>
        <pre>{answer?.value?.length || 0} characters</pre>
      </div>
    </div>
  );
}

export function MarkdownFillInBlankExample() {
  const config: FillInBlankConfig = {
    id: 'fib-md-1',
    type: 'fill-in-blank',
    question: 'Complete the code snippet',
    instructions: 'Fill in the blanks to create a valid **React** component',
    points: 15,
    segments: [
      { type: 'text', content: 'The `' },
      {
        type: 'blank',
        id: 'blank1',
        correctAnswers: ['useState'],
        placeholder: 'hook name',
      },
      { type: 'text', content: '` hook returns an *array* with ' },
      {
        type: 'blank',
        id: 'blank2',
        correctAnswers: ['2', 'two'],
        placeholder: 'number',
      },
      { type: 'text', content: ' elements: the **current state** and a ' },
      {
        type: 'blank',
        id: 'blank3',
        correctAnswers: ['setter', 'function'],
        placeholder: 'type',
      },
      { type: 'text', content: ' to update it.' },
    ],
    feedback: {
      hints: [
        'Think about the most common **state** hook in React',
        'The hook returns `[state, setState]`',
      ],
    },
  };

  const [answer, setAnswer] =
    useState<QuestionAnswer<Record<string, string>>>();

  return (
    <div className="example-container">
      <h2>Markdown Fill in the Blank Example</h2>
      <FillInBlank
        config={config}
        renderContent={markdownRenderer}
        onAnswerChange={(ans) => setAnswer(ans)}
      />
      <div className="example-output">
        <h3>Current Answer:</h3>
        <pre>{JSON.stringify(answer?.value, null, 2)}</pre>
      </div>
    </div>
  );
}

export function MarkdownMatchingExampleOne() {
  const config: MatchingConfig = {
    id: 'match-md-1',
    type: 'matching',
    question:
      'Match each **programming concept** with its correct *definition*',
    instructions:
      'Select the matching definition for each term from the dropdown',
    points: 20,
    pairs: [
      {
        id: 'pair1',
        left: '**Recursion**',
        right: 'A function that *calls itself* until a base case is reached',
      },
      {
        id: 'pair2',
        left: '**Polymorphism**',
        right: 'The ability of objects to take on *multiple forms*',
      },
      {
        id: 'pair3',
        left: '**Encapsulation**',
        right:
          'Bundling data and methods that operate on that data within a **single unit**',
      },
      {
        id: 'pair4',
        left: '`Async/Await`',
        right: 'Syntax for handling *asynchronous* operations in JavaScript',
      },
    ],
    randomizeLeft: true,
    randomizeRight: true,
    feedback: {
      hints: [
        'Think about **OOP principles** and **programming paradigms**',
        'Consider how each concept is used in *modern software development*',
      ],
    },
  };

  const [answer, setAnswer] =
    useState<QuestionAnswer<Record<string, string>>>();

  return (
    <div className="example-container">
      <h2>Markdown Matching Example</h2>
      <Matching
        config={config}
        renderContent={markdownRenderer}
        onAnswerChange={(ans) => setAnswer(ans)}
      />
      <div className="example-output">
        <h3>Current Answer:</h3>
        <pre>{JSON.stringify(answer?.value, null, 2)}</pre>
      </div>
    </div>
  );
}

export function MarkdownFormattingShowcaseExample() {
  const config: MultipleChoiceConfig = {
    id: 'mc-showcase',
    type: 'multiple-choice',
    question: `# Markdown Formatting Showcase

This question demonstrates **all** *major* Markdown features:

## Text Formatting
- **Bold text** using double asterisks
- *Italic text* using single asterisks
- ***Bold and italic*** using triple asterisks
- ~~Strikethrough~~ using tildes
- \`Inline code\` using backticks

## Links and Images
Visit the [React Documentation](https://react.dev) for more info.

## Code Blocks
\`\`\`javascript
const greeting = "Hello World";
console.log(greeting);
\`\`\`

## Quotes
> "Programming is the art of telling another human what one wants the computer to do."
> — Donald Knuth

## Lists
1. First item
2. Second item
3. Third item

Now, which statement is **correct**?`,
    instructions:
      'Review the Markdown rendering above and select the correct answer',
    points: 10,
    options: [
      {
        id: 'opt1',
        text: 'Markdown is a **markup language** for formatting *plain text*',
        isCorrect: true,
        feedback:
          '✅ **Correct!** Markdown is indeed a lightweight markup language.',
      },
      {
        id: 'opt2',
        text: 'Markdown requires `compilation` before use',
        isCorrect: false,
        feedback: '❌ Incorrect. Markdown is interpreted, not compiled.',
      },
      {
        id: 'opt3',
        text: 'Markdown cannot render *code blocks*',
        isCorrect: false,
      },
      {
        id: 'opt4',
        text: '~~Markdown~~ is obsolete',
        isCorrect: false,
      },
    ],
    allowMultiple: false,
    feedback: {
      hints: [
        'Look at how the **question** itself is formatted',
        'Markdown is widely used in *documentation* and README files',
      ],
    },
  };

  const [_answer, setAnswer] = useState<QuestionAnswer<string>>();

  return (
    <div className="example-container">
      <h2>Markdown Formatting Showcase</h2>
      <MultipleChoice
        config={config}
        renderContent={markdownRenderer}
        onAnswerChange={(ans) => setAnswer(ans)}
        showFeedback={true}
      />
    </div>
  );
}

export function MarkdownWithImagesExample() {
  const config: MultipleChoiceConfig = {
    id: 'mc-img-1',
    type: 'multiple-choice',
    question: `Which logo belongs to **React**?

![React Logo](https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg)

The React logo features a distinctive *atom-like* symbol.`,
    instructions: 'Look at the image above and select the correct description',
    points: 5,
    options: [
      {
        id: 'opt1',
        text: 'A **blue atom** with orbiting electrons',
        isCorrect: true,
      },
      { id: 'opt2', text: 'A *green tree* symbol', isCorrect: false },
      { id: 'opt3', text: 'An orange `</>` code symbol', isCorrect: false },
      { id: 'opt4', text: 'A red diamond shape', isCorrect: false },
    ],
    allowMultiple: false,
  };

  const [_answer, setAnswer] = useState<QuestionAnswer<string>>();

  return (
    <div className="example-container">
      <h2>Markdown with Images Example</h2>
      <MultipleChoice
        config={config}
        renderContent={markdownRenderer}
        onAnswerChange={(ans) => setAnswer(ans)}
      />
    </div>
  );
}

export function MarkdownCodeQuestionExample() {
  const config: ShortAnswerConfig = {
    id: 'sa-code-1',
    type: 'short-answer',
    question: `What will this **JavaScript** code output?

\`\`\`javascript
const arr = [1, 2, 3];
console.log(arr[3]);
\`\`\`

> **Hint:** Arrays are *zero-indexed* in JavaScript`,
    instructions: 'Type your answer below (exact value)',
    points: 5,
    correctAnswers: ['undefined'],
    caseSensitive: false,
    trimWhitespace: true,
    placeholder: 'Type the output...',
  };

  const [_answer, setAnswer] = useState<QuestionAnswer<string>>();

  return (
    <div className="example-container">
      <h2>Markdown Code Question Example</h2>
      <ShortAnswer
        config={config}
        renderContent={markdownRenderer}
        onAnswerChange={(ans) => setAnswer(ans)}
      />
    </div>
  );
}

export function MarkdownListsExample() {
  const config: EssayConfig = {
    id: 'essay-lists-1',
    type: 'essay',
    question: `Explain the **SOLID** principles in software engineering.

The SOLID principles are:
1. **S**ingle Responsibility Principle
2. **O**pen/Closed Principle
3. **L**iskov Substitution Principle
4. **I**nterface Segregation Principle
5. **D**ependency Inversion Principle

Your essay should cover:
- Definition of each principle
- *Real-world* examples
- Benefits of following these principles

> "Good software design is about making code that is easy to change." — *Martin Fowler*`,
    instructions: 'Write at least **300 words**',
    points: 50,
    minWords: 300,
    maxWords: 800,
  };

  const [_answer, setAnswer] = useState<QuestionAnswer<string>>();

  return (
    <div className="example-container">
      <h2>Markdown Lists Example</h2>
      <Essay
        config={config}
        renderContent={markdownRenderer}
        onAnswerChange={(ans) => setAnswer(ans)}
      />
    </div>
  );
}

export function MarkdownComplexFillInBlankExample() {
  const config: FillInBlankConfig = {
    id: 'fib-complex-1',
    type: 'fill-in-blank',
    question: 'Complete the Git commands',
    instructions: 'Fill in the blanks with the correct **Git** commands',
    points: 15,
    segments: [
      { type: 'text', content: 'To create a new branch, use `git ' },
      {
        type: 'blank',
        id: 'blank1',
        correctAnswers: ['branch', 'checkout -b'],
        placeholder: 'command',
      },
      {
        type: 'text',
        content: ' branch-name`. To switch to an *existing* branch, use `git ',
      },
      {
        type: 'blank',
        id: 'blank2',
        correctAnswers: ['checkout', 'switch'],
        placeholder: 'command',
      },
      {
        type: 'text',
        content: ' branch-name`. Finally, to **merge** a branch, use `git ',
      },
      {
        type: 'blank',
        id: 'blank3',
        correctAnswers: ['merge'],
        placeholder: 'command',
      },
      { type: 'text', content: ' branch-name`.' },
    ],
    feedback: {
      hints: [
        'Common Git commands include: `branch`, `checkout`, `commit`, `merge`',
        'The `checkout` command can do multiple things depending on the **flags** used',
      ],
    },
  };

  const [_answer, setAnswer] =
    useState<QuestionAnswer<Record<string, string>>>();

  return (
    <div className="example-container">
      <h2>Markdown Complex Fill in the Blank Example</h2>
      <FillInBlank
        config={config}
        renderContent={markdownRenderer}
        onAnswerChange={(ans) => setAnswer(ans)}
      />
    </div>
  );
}

export function MarkdownMatchingExample() {
  const config: MatchingConfig = {
    id: 'match-md-1',
    type: 'matching',
    question: `Match each **HTTP method** with its *purpose*

> HTTP methods define the action to be performed on a resource`,
    instructions: 'Select the correct purpose for each HTTP method',
    points: 20,
    pairs: [
      {
        id: 'pair1',
        left: '`GET`',
        right: '*Retrieve* data from the server',
      },
      {
        id: 'pair2',
        left: '`POST`',
        right: '**Create** a new resource on the server',
      },
      {
        id: 'pair3',
        left: '`PUT`',
        right: '**Update** an existing resource completely',
      },
      {
        id: 'pair4',
        left: '`DELETE`',
        right: '~~Remove~~ **Delete** a resource from the server',
      },
    ],
    randomizeLeft: false,
    randomizeRight: true,
    feedback: {
      hints: [
        'Think about **CRUD** operations: Create, Read, Update, Delete',
        '`GET` is for *reading*, `POST` is for *creating*',
      ],
    },
  };

  const [_answer, setAnswer] =
    useState<QuestionAnswer<Record<string, string>>>();

  return (
    <div className="example-container">
      <h2>Markdown Matching Example</h2>
      <Matching
        config={config}
        renderContent={markdownRenderer}
        onAnswerChange={(ans) => setAnswer(ans)}
      />
    </div>
  );
}

export function MarkdownExamples() {
  return (
    <div className="all-examples">
      <h1>Markdown Rendered Questions - All Types</h1>
      <p className="subtitle">
        These examples demonstrate Markdown formatting across all question types
      </p>

      <div
        className="markdown-features-info"
        style={{
          padding: '1rem',
          background: '#f0f9ff',
          borderLeft: '4px solid #0ea5e9',
          marginBottom: '2rem',
          borderRadius: '0.5rem',
        }}
      >
        <h3>Supported Markdown Features:</h3>
        <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li>**Bold** - Double asterisks</li>
          <li>*Italic* - Single asterisks</li>
          <li>`Code` - Backticks</li>
          <li>[Links](url) - Bracket syntax</li>
          <li>![Images](url) - Exclamation + brackets</li>
          <li>&gt; Quotes - Greater than symbol</li>
          <li>~~Strikethrough~~ - Double tildes</li>
          <li>Lists - Numbered or bulleted</li>
          <li>Code blocks - Triple backticks</li>
        </ul>
      </div>

      <MarkdownFormattingShowcaseExample />
      <hr style={{ margin: '3rem 0' }} />

      <MarkdownMultipleChoiceExample />
      <hr style={{ margin: '3rem 0' }} />

      <MarkdownTrueOrFalseExample />
      <hr style={{ margin: '3rem 0' }} />

      <MarkdownShortAnswerExample />
      <hr style={{ margin: '3rem 0' }} />

      <MarkdownEssayExample />
      <hr style={{ margin: '3rem 0' }} />

      <MarkdownFillInBlankExample />
      <hr style={{ margin: '3rem 0' }} />

      <MarkdownMatchingExampleOne />
      <hr style={{ margin: '3rem 0' }} />

      <MarkdownMatchingExample />
      <hr style={{ margin: '3rem 0' }} />

      <MarkdownWithImagesExample />
      <hr style={{ margin: '3rem 0' }} />

      <MarkdownCodeQuestionExample />
    </div>
  );
}
