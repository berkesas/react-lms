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

// Create storage manager
const storageManager = createLocalStorageManager('demo_user');

// Styled Quiz Example with Tailwind CSS
export function TailwindStyledQuizExample() {
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoSaveInterval, setAutoSaveInterval] = useState(20000);

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            <h1 className="text-2xl font-bold text-gray-800">
              Loading Quiz...
            </h1>
            <p className="text-gray-600 text-center">
              Please wait while we load the quiz data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-red-100 rounded-full p-3">
              <svg
                className="w-12 h-12 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              Error Loading Quiz
            </h1>
            <p className="text-red-600 text-center font-medium">{error}</p>
            <button
              onClick={() => loadQuizData('quizzes/quiz1.json')}
              className="mt-4 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!quizConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            No Quiz Data
          </h1>
          <p className="text-gray-600">Quiz configuration is not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <StyledQuizWithStorage
        quizConfig={quizConfig}
        autoSaveInterval={autoSaveInterval}
        setAutoSaveInterval={setAutoSaveInterval}
      />
    </div>
  );
}

// Styled Quiz Component with Storage and Grading
// Styled Quiz Component with Storage and Grading (MOBILE-OPTIMIZED)
function StyledQuizWithStorage({
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
    await storage.saveResult(result);
    console.log('Graded result saved:', {
      score: result.score,
      percentage: result.percentage,
      isPassed: result.isPassed,
    });
    setShowingResults(true);
  };

  const handleRetake = () => {
    setShowingResults(false);
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
      {/* Header Section - MOBILE OPTIMIZED */}
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 break-words">
              {quizConfig.title}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 break-words">
              {quizConfig.description}
            </p>
          </div>
          <div className="bg-indigo-100 rounded-full p-3 md:p-4 flex-shrink-0">
            <svg
              className="w-8 h-8 md:w-10 md:h-10 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* AUTO-SAVE CONTROLS - MOBILE OPTIMIZED */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
            <span className="font-semibold text-base sm:text-lg">Auto-save Settings</span>
          </div>
          <select
            value={autoSaveInterval}
            onChange={(e) => setAutoSaveInterval(Number(e.target.value))}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg bg-white text-gray-800 text-sm sm:text-base font-medium shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
          >
            <option value={0}>Disabled</option>
            <option value={1000}>1 second</option>
            <option value={2000}>2 seconds</option>
            <option value={5000}>5 seconds</option>
            <option value={10000}>10 seconds</option>
            <option value={30000}>30 seconds</option>
          </select>
        </div>
        <div className="mt-3 flex items-center space-x-2 text-xs sm:text-sm">
          {autoSaveInterval === 0 ? (
            <>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-yellow-100">Auto-save is disabled</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-green-300 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-green-100">
                Auto-saving every {autoSaveInterval / 1000} second(s)
              </span>
            </>
          )}
        </div>
      </div>

      {/* Storage Statistics - MOBILE OPTIMIZED */}
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center space-x-3 mb-4 sm:mb-6">
          <div className="bg-purple-100 rounded-lg p-2">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Your Statistics</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 sm:p-4 border border-blue-200">
            <div className="text-xs sm:text-sm font-medium text-blue-600 mb-1">
              Total Attempts
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-900">
              {storage.statistics.totalAttempts}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 sm:p-4 border border-green-200">
            <div className="text-xs sm:text-sm font-medium text-green-600 mb-1">
              Best Score
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-green-900">
              {storage.statistics.bestScore.toFixed(1)}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 sm:p-4 border border-purple-200">
            <div className="text-xs sm:text-sm font-medium text-purple-600 mb-1">
              Average Score
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-purple-900">
              {storage.statistics.averageScore.toFixed(1)}
            </div>
          </div>
        </div>

        {storage.allAttempts.length > 0 && (
          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Attempt History
            </h4>
            <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto">
              {storage.allAttempts.map((attempt, index) => (
                <div
                  key={attempt.attemptNumber}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${
                        index === 0
                          ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                          : 'bg-gradient-to-br from-gray-400 to-gray-600'
                      }`}
                    >
                      {attempt.attemptNumber}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 text-sm sm:text-base">
                        {attempt.score}/{attempt.maxScore} points
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 truncate">
                        {attempt.percentage.toFixed(1)}% •{' '}
                        {new Date(attempt.submittedAt).toLocaleDateString()}{' '}
                        {new Date(attempt.submittedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => storage.deleteAttempt(attempt.attemptNumber)}
                    className="w-full sm:w-auto px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md flex-shrink-0"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {storage.allAttempts.length > 0 && (
          <button
            onClick={storage.clearAll}
            className="mt-4 sm:mt-6 w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm sm:text-base font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Clear All Attempts
          </button>
        )}
      </div>

      {/* Show results or quiz */}
      {showingResults && storage.latestResult ? (
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
          <Quiz config={quizConfig} loadedResult={storage.latestResult}>
            <QuizResults onRetake={handleRetake} />
          </Quiz>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
          <Quiz
            config={quizConfig}
            onQuizSubmit={handleQuizSubmit}
            storageManager={storageManager}
            autoSaveInterval={autoSaveInterval}
          >
            <StyledQuizContent />
          </Quiz>
        </div>
      )}
    </div>
  );
}

// Styled Quiz Content Component
function StyledQuizContent() {
  const { currentQuestion, setAnswer } = useQuizContext();

  if (!currentQuestion) return null;

  return (
    <div className="space-y-6">
      {/* Progress Bar with custom styling */}
      <div className="mb-8">
        <QuizProgressBar />
      </div>

      {/* Question Card */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200 shadow-md">
        <div className="flex items-start space-x-4 mb-6">
          <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
            ?
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-indigo-600 mb-2 uppercase tracking-wide">
              Question {currentQuestion.id}
            </div>
            {currentQuestion.points && (
              <div className="mt-2 inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {currentQuestion.points} points
              </div>
            )}
          </div>
        </div>

        <div className="quiz-question-wrapper">
          {currentQuestion.type === 'multiple-choice' && (
            <div className="space-y-3">
              <MultipleChoice
                config={currentQuestion as any}
                onAnswerChange={(answer) =>
                  setAnswer(currentQuestion.id, answer)
                }
              />
            </div>
          )}
          {currentQuestion.type === 'true-false' && (
            <div className="space-y-3">
              <TrueOrFalse
                config={currentQuestion as any}
                onAnswerChange={(answer) =>
                  setAnswer(currentQuestion.id, answer)
                }
              />
            </div>
          )}
          {currentQuestion.type === 'short-answer' && (
            <div className="space-y-3">
              <ShortAnswer
                config={currentQuestion as any}
                onAnswerChange={(answer) =>
                  setAnswer(currentQuestion.id, answer)
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* Navigation with custom styling */}
      <div className="pt-6 border-t border-gray-200">
        <QuizNavigation showQuestionList />
      </div>
    </div>
  );
}

// Styled Quiz Library Example
export function StyledQuizLibraryExample() {
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
  const [autoSaveInterval, setAutoSaveInterval] = useState(200000);

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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Quiz Library
            </h1>
            <p className="text-xl text-gray-600">
              Select a quiz to test your knowledge
            </p>
          </div>

          {/* Quiz Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableQuizzes.map((quiz, index) => (
              <div
                key={quiz.id}
                className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group"
              >
                {/* Card Header with Gradient */}
                <div
                  className={`h-32 bg-gradient-to-br ${
                    index % 3 === 0
                      ? 'from-blue-500 to-indigo-600'
                      : index % 3 === 1
                        ? 'from-purple-500 to-pink-600'
                        : 'from-green-500 to-teal-600'
                  } flex items-center justify-center`}
                >
                  <svg
                    className="w-16 h-16 text-white opacity-90"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-200">
                    {quiz.title}
                  </h3>
                  <p className="text-gray-600 mb-6 line-clamp-3">
                    {quiz.description}
                  </p>
                  <button
                    onClick={() => loadSpecificQuiz(quiz.filePath)}
                    disabled={loading}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                      loading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Loading...
                      </span>
                    ) : (
                      'Start Quiz'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {availableQuizzes.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
                <svg
                  className="w-20 h-20 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Quizzes Available
                </h3>
                <p className="text-gray-500">
                  Check back later for new quizzes!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => setSelectedQuiz(null)}
          className="mb-6 flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>Back to Quiz Library</span>
        </button>
        <StyledQuizWithStorage
          quizConfig={selectedQuiz}
          autoSaveInterval={autoSaveInterval}
          setAutoSaveInterval={setAutoSaveInterval}
        />
      </div>
    </div>
  );
}
