import { ReactNode, useMemo, useCallback, useState } from 'react';
import type {
  QuestionConfig,
  Feedback,
  ValidationResult,
  ContentRenderer,
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
  initialAnswer?: T;
  children?: ReactNode;
  renderContent?: ContentRenderer; // ✅ NEW: Custom content renderer
  onAnswerChange?: (answer: any) => void;
  onSubmit?: (answer: any) => void;
  onValidationChange?: (result: ValidationResult) => void;
  showFeedback?: boolean;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

export function BaseQuestion<T = any>(props: BaseQuestionProps<T>) {
  const {
    config,
    initialAnswer,
    children,
    renderContent, // ✅ Extract renderContent
    onAnswerChange,
    onSubmit,
    onValidationChange,
    showFeedback = false,
    disabled = false,
    className,
    'aria-label': ariaLabel,
  } = props;

  // State management
  const questionState = useQuestionState<T>({
    config,
    initialAnswer,
    onAnswerChange,
  });

  // Validation
  const validationRules =
    'validation' in config ? config.validation?.rules : undefined;
  const questionValidation = useQuestionValidation<T>({
    value: questionState.answer.value,
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
        onSubmit(questionState.answer);
      }
    },
    autoStart: true,
  });

  // Feedback state
  const [currentFeedback, setCurrentFeedback] = useState<
    Feedback | undefined
  >();

  // Check if question is locked
  const isLocked = useMemo(() => {
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
    }
  }, [questionValidation, config.feedback]);

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (isLocked) return;

    handleValidate().then(() => {
      questionState.setStatus('submitted');
      if (onSubmit) {
        onSubmit(questionState.answer);
      }

      // Show appropriate feedback
      if (
        showFeedback &&
        questionValidation.validation.isValid &&
        config.feedback?.correct
      ) {
        setCurrentFeedback(config.feedback.correct);
      }
    });
  }, [
    isLocked,
    handleValidate,
    questionState,
    onSubmit,
    showFeedback,
    questionValidation.validation.isValid,
    config.feedback,
  ]);

  // Context value
  const contextValue: QuestionContextValue<T> = useMemo(
    () => ({
      config,
      answer: questionState.answer,
      setAnswer: questionState.setAnswer,
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
      feedback: currentFeedback,
      isLocked,
      onSubmit: handleSubmit,
      renderContent, // ✅ NEW: Pass renderContent to context
    }),
    [
      config,
      questionState,
      questionValidation.validation,
      handleValidate,
      showFeedback,
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
