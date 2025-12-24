import { ReactNode, useMemo, useCallback, useState } from 'react';
import type {
  QuestionConfig,
  Feedback,
  ValidationResult,
  ContentRenderer,
  QuestionAnswer,
} from '../../../types';
import { useQuestionState } from '../../../hooks/questions/useQuestionState';
import { useQuestionValidation } from '../../../hooks/questions/useQuestionValidation';
import { useQuestionTimer } from '../../../hooks/questions/useQuestionTimer';
import {
  QuestionProvider,
  QuestionContextValue,
} from '../../../context/QuestionContext';

export interface BaseQuestionProps<T = any> {
  config: QuestionConfig;
  answer?: QuestionAnswer<T>;
  initialAnswer?: T;
  children?: ReactNode;
  renderContent?: ContentRenderer;
  onAnswerChange?: (answer: any) => void;
  onSubmit?: (answer: any) => void;
  onValidationChange?: (result: ValidationResult) => void;
  showFeedback?: boolean;
  showCheckButton?: boolean;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

export function BaseQuestion<T = any>(props: BaseQuestionProps<T>) {
  const {
    config,
    answer: externalAnswer,
    initialAnswer,
    children,
    renderContent,
    onAnswerChange,
    onSubmit,
    onValidationChange,
    showFeedback = false,
    showCheckButton = false,
    disabled = false,
    className,
    'aria-label': ariaLabel,
  } = props;

  const isControlled = externalAnswer !== undefined;

  // State management (only used in uncontrolled mode)
  const questionState = useQuestionState<T>({
    config,
    initialAnswer: initialAnswer,
  });

  // Use external answer if controlled, internal state if uncontrolled
  const currentAnswer = (
    isControlled ? externalAnswer : questionState.answer
  ) as QuestionAnswer<T>;

  // Validation - Use currentAnswer, not questionState.answer
  const validationRules =
    'validation' in config ? config.validation?.rules : undefined;
  const questionValidation = useQuestionValidation<T>({
    value: currentAnswer?.value,
    rules: validationRules,
    validateOnChange:
      'validation' in config ? config.validation?.validateOnChange : false,
    onValidationChange,
  });

  // Timer
  const timer = useQuestionTimer({
    timeLimit: config.timeLimit,
    onTimeUp: () => {
      questionState.setStatus('submitted');
      if (onSubmit) {
        onSubmit(currentAnswer);
      }
    },
    autoStart: true,
  });

  // Feedback state
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | undefined>();

  // Check if question is locked
  const isLocked = useMemo(() => {
    if (config.maxAttempts === Infinity) return false;
    return (
      disabled ||
      questionState.status === 'submitted' ||
      questionState.status === 'graded' ||
      (config.maxAttempts !== undefined &&
        questionState.attemptNumber > config.maxAttempts) ||
      timer.isTimeUp
    );
  }, [
    disabled,
    questionState.status,
    questionState.attemptNumber,
    config.maxAttempts,
    timer.isTimeUp,
  ]);

  // Handle validation
  const handleValidate = useCallback(async () => {
    const result = await questionValidation.validate();

    if (!result.isValid && config.feedback?.incorrect) {
      setCurrentFeedback(config.feedback.incorrect);
      questionState.incrementAttempt();
      console.log('attempt number:', questionState.attemptNumber);
    } else if (result.isValid && config.feedback?.correct) {
      setCurrentFeedback(config.feedback.correct);
    }

    return result;
  }, [questionValidation, config.feedback, questionState]);

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (isLocked) return;

    handleValidate().then((result) => {
      if (result.isValid) {
        questionState.setStatus('submitted');
        if (onSubmit) {
          onSubmit(currentAnswer);
        }
      }
    });
  }, [
    isLocked,
    handleValidate,
    questionState,
    currentAnswer,
    onSubmit,
  ]);

  const handleAnswerChange = useCallback(
    (newValue: T) => {
      // Construct full answer object
      const fullAnswer: QuestionAnswer<T> = {
        questionId: config.id,
        value: newValue,
        isAnswered:
          newValue !== null && newValue !== undefined && newValue !== '',
        attemptNumber: questionState.attemptNumber,
        timeSpent: questionState.timeSpent,
        timestamp: new Date().toISOString(),
      };

      // Update internal state in uncontrolled mode
      if (!isControlled) {
        questionState.setAnswer(newValue);
      }

      // Always notify parent
      if (onAnswerChange) {
        onAnswerChange(fullAnswer);
      }
    },
    [isControlled, questionState, onAnswerChange, config.id]
  );

  // Context value
  const contextValue: QuestionContextValue<T> = useMemo(
    () => ({
      config,
      answer: currentAnswer,
      setAnswer: handleAnswerChange,
      clearAnswer: questionState.clearAnswer,
      status: questionState.status,
      setStatus: questionState.setStatus,
      attemptNumber: questionState.attemptNumber,
      incrementAttempt: questionState.incrementAttempt,
      timeSpent: questionState.timeSpent,
      isAnswered: questionState.isAnswered,
      validation: {
        isValid: questionValidation.validation.isValid,
        errors: questionValidation.validation.errors || [],
        warnings: questionValidation.validation.warnings || [],
      },
      validate: handleValidate,
      showFeedback,
      showCheckButton,
      feedback: currentFeedback,
      isLocked,
      submit: handleSubmit,
      renderContent,
    }),
    [
      config,
      currentAnswer,
      handleAnswerChange,
      questionState.clearAnswer,
      questionState.status,
      questionState.setStatus,
      questionState.attemptNumber,
      questionState.incrementAttempt,
      questionState.timeSpent,
      questionState.isAnswered,
      questionValidation.validation,
      handleValidate,
      showFeedback,
      showCheckButton,
      currentFeedback,
      isLocked,
      handleSubmit,
      renderContent,
    ]
  );

  return (
    <QuestionProvider value={contextValue}>
      <div
        className={`picolms-base-question ${className || ''}`}
        role="group"
        aria-label={
          ariaLabel ||
          config.accessibility?.ariaLabel ||
          `Question: ${config.question}`
        }
        aria-describedby={config.accessibility?.ariaDescribedBy}
      >
        {children}
      </div>
    </QuestionProvider>
  );
}
