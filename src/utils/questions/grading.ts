import type {
  QuestionConfig,
  QuestionAnswer,
  MultipleChoiceConfig,
  TrueFalseConfig,
  ShortAnswerConfig,
  FillInBlankConfig,
  MatchingConfig,
} from '../../types';

export interface GradingResult {
  isCorrect: boolean;
  isPartiallyCorrect: boolean;
  score: number;
  maxScore: number;
  feedback?: string;
}

/**
 * Grade a question answer
 */
export function gradeQuestion(
  config: QuestionConfig,
  answer: QuestionAnswer
): GradingResult {
  switch (config.type) {
    case 'multiple-choice':
      return gradeMultipleChoice(config, answer);
    case 'true-false':
      return gradeTrueFalse(config, answer);
    case 'short-answer':
      return gradeShortAnswer(config, answer);
    case 'essay':
      // Essays typically require manual grading
      return {
        isCorrect: false,
        isPartiallyCorrect: false,
        score: 0,
        maxScore: config.points,
        feedback: 'This question requires manual grading',
      };
    case 'fill-in-blank':
      return gradeFillInBlank(config, answer);
    case 'matching':
      return gradeMatching(config, answer);
  }

  // Exhaustiveness check
  void config;
}

/**
 * Grade multiple choice question
 */
function gradeMultipleChoice(
  config: MultipleChoiceConfig,
  answer: QuestionAnswer
): GradingResult {
  const correctOptionIds = config.options
    .filter(opt => opt.isCorrect)
    .map(opt => opt.id);

  const userAnswers = Array.isArray(answer.value)
    ? answer.value
    : answer.value ? [answer.value] : [];

  if (!answer.isAnswered || userAnswers.length === 0) {
    return {
      isCorrect: false,
      isPartiallyCorrect: false,
      score: 0,
      maxScore: config.points,
      feedback: 'No answer provided',
    };
  }

  // For single select
  if (!config.allowMultiple) {
    const isCorrect = userAnswers.length === 1 && correctOptionIds.includes(userAnswers[0]);
    return {
      isCorrect,
      isPartiallyCorrect: false,
      score: isCorrect ? config.points : 0,
      maxScore: config.points,
    };
  }

  // For multi-select
  const correctCount = userAnswers.filter(id => correctOptionIds.includes(id)).length;
  const incorrectCount = userAnswers.filter(id => !correctOptionIds.includes(id)).length;

  const isFullyCorrect = correctCount === correctOptionIds.length && incorrectCount === 0;
  const isPartiallyCorrect = correctCount > 0 && !isFullyCorrect;

  // Calculate partial credit
  const percentCorrect = correctCount / correctOptionIds.length;
  const penalty = incorrectCount / correctOptionIds.length;
  const finalPercent = Math.max(0, percentCorrect - penalty);

  return {
    isCorrect: isFullyCorrect,
    isPartiallyCorrect,
    score: finalPercent * config.points,
    maxScore: config.points,
  };
}

/**
 * Grade true/false question
 */
function gradeTrueFalse(
  config: TrueFalseConfig,
  answer: QuestionAnswer
): GradingResult {
  if (!answer.isAnswered || answer.value === undefined || answer.value === null) {
    return {
      isCorrect: false,
      isPartiallyCorrect: false,
      score: 0,
      maxScore: config.points,
      feedback: 'No answer provided',
    };
  }

  const isCorrect = answer.value === config.correctAnswer;

  return {
    isCorrect,
    isPartiallyCorrect: false,
    score: isCorrect ? config.points : 0,
    maxScore: config.points,
  };
}

/**
 * Grade short answer question
 */
function gradeShortAnswer(
  config: ShortAnswerConfig,
  answer: QuestionAnswer
): GradingResult {
  if (!answer.isAnswered || !answer.value) {
    return {
      isCorrect: false,
      isPartiallyCorrect: false,
      score: 0,
      maxScore: config.points,
      feedback: 'No answer provided',
    };
  }

  // If no correct answers provided, needs manual grading
  if (!config.correctAnswers || config.correctAnswers.length === 0) {
    return {
      isCorrect: false,
      isPartiallyCorrect: false,
      score: 0,
      maxScore: config.points,
      feedback: 'This question requires manual grading',
    };
  }

  let userAnswer = String(answer.value);

  // Apply transformations
  if (config.trimWhitespace) {
    userAnswer = userAnswer.trim();
  }
  if (!config.caseSensitive) {
    userAnswer = userAnswer.toLowerCase();
  }

  // Check against all acceptable answers
  const isCorrect = config.correctAnswers.some(correctAnswer => {
    let processedCorrect = correctAnswer;
    if (config.trimWhitespace) {
      processedCorrect = processedCorrect.trim();
    }
    if (!config.caseSensitive) {
      processedCorrect = processedCorrect.toLowerCase();
    }
    return userAnswer === processedCorrect;
  });

  return {
    isCorrect,
    isPartiallyCorrect: false,
    score: isCorrect ? config.points : 0,
    maxScore: config.points,
  };
}

/**
 * Grade fill in the blank question
 */
function gradeFillInBlank(
  config: FillInBlankConfig,
  answer: QuestionAnswer
): GradingResult {
  if (!answer.isAnswered || !answer.value) {
    return {
      isCorrect: false,
      isPartiallyCorrect: false,
      score: 0,
      maxScore: config.points,
      feedback: 'No answer provided',
    };
  }

  const userAnswers = answer.value as Record<string, string>;
  const blanks = config.segments.filter(seg => seg.type === 'blank');

  let correctCount = 0;
  let totalBlanks = blanks.length;

  blanks.forEach(blank => {
    const userAnswer = userAnswers[blank.id!];
    if (!userAnswer) return;

    let processedUser = userAnswer;
    if (blank.caseSensitive !== true) {
      processedUser = processedUser.toLowerCase();
    }
    processedUser = processedUser.trim();

    const isBlankCorrect = blank.correctAnswers?.some(correct => {
      let processedCorrect = correct;
      if (blank.caseSensitive !== true) {
        processedCorrect = processedCorrect.toLowerCase();
      }
      processedCorrect = processedCorrect.trim();
      return processedUser === processedCorrect;
    });

    if (isBlankCorrect) correctCount++;
  });

  const isFullyCorrect = correctCount === totalBlanks;
  const isPartiallyCorrect = correctCount > 0 && !isFullyCorrect;
  const percentCorrect = totalBlanks > 0 ? correctCount / totalBlanks : 0;

  return {
    isCorrect: isFullyCorrect,
    isPartiallyCorrect,
    score: percentCorrect * config.points,
    maxScore: config.points,
  };
}

/**
 * Grade matching question
 */
function gradeMatching(
  config: MatchingConfig,
  answer: QuestionAnswer
): GradingResult {
  if (!answer.isAnswered || !answer.value) {
    return {
      isCorrect: false,
      isPartiallyCorrect: false,
      score: 0,
      maxScore: config.points,
      feedback: 'No answer provided',
    };
  }

  const userMatches = answer.value as Record<string, string>;
  const totalPairs = config.pairs.length;
  let correctCount = 0;

  config.pairs.forEach(pair => {
    const userRight = userMatches[pair.id];
    if (userRight === pair.right) {
      correctCount++;
    }
  });

  const isFullyCorrect = correctCount === totalPairs;
  const isPartiallyCorrect = correctCount > 0 && !isFullyCorrect;
  const percentCorrect = totalPairs > 0 ? correctCount / totalPairs : 0;

  return {
    isCorrect: isFullyCorrect,
    isPartiallyCorrect,
    score: percentCorrect * config.points,
    maxScore: config.points,
  };
}

/**
 * Grade an entire quiz
 */
export function gradeQuiz(
  config: { questions: QuestionConfig[] },
  answers: Map<string, QuestionAnswer>
): {
  totalScore: number;
  maxScore: number;
  percentage: number;
  results: Map<string, GradingResult>;
} {
  const results = new Map<string, GradingResult>();
  let totalScore = 0;
  let maxScore = 0;

  config.questions.forEach(question => {
    const answer = answers.get(question.id);

    if (!answer) {
      // No answer provided
      results.set(question.id, {
        isCorrect: false,
        isPartiallyCorrect: false,
        score: 0,
        maxScore: question.points,
        feedback: 'No answer provided',
      });
      maxScore += question.points;
      return;
    }

    const result = gradeQuestion(question, answer);
    results.set(question.id, result);
    totalScore += result.score;
    maxScore += result.maxScore;
  });

  return {
    totalScore,
    maxScore,
    percentage: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
    results,
  };
}