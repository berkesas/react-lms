import { useState, useCallback, useEffect } from 'react';
import type { ValidationRule, ValidationResult } from '../../types';

export interface UseQuestionValidationOptions<T = any> {
  value: T;
  rules?: ValidationRule[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  onValidationChange?: (result: ValidationResult) => void;
}

export interface UseQuestionValidationReturn {
  validation: ValidationResult;
  validate: () => Promise<ValidationResult>;
  clearValidation: () => void;
  isValidating: boolean;
}

export function useQuestionValidation<T = any>(
  options: UseQuestionValidationOptions<T>
): UseQuestionValidationReturn {
  const { 
    value, 
    rules = [], 
    validateOnChange = false, 
    onValidationChange 
  } = options;

  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
  });

  const [isValidating, setIsValidating] = useState(false);

  // Validate function
  const validate = useCallback(async (): Promise<ValidationResult> => {
    if (!rules || rules.length === 0) {
      return { isValid: true, errors: [], warnings: [] };
    }

    setIsValidating(true);

    const errors: string[] = [];

    for (const rule of rules) {
      try {
        let isValid = true;

        switch (rule.type) {
          case 'required':
            isValid = value !== null && value !== undefined && value !== '';
            break;

          case 'minLength':
            if (typeof value === 'string') {
              isValid = value.length >= (rule.value as number);
            }
            break;

          case 'maxLength':
            if (typeof value === 'string') {
              isValid = value.length <= (rule.value as number);
            }
            break;

          case 'pattern':
            if (typeof value === 'string' && rule.value) {
              const regex = new RegExp(rule.value as string);
              isValid = regex.test(value);
            }
            break;

          case 'custom':
            if (rule.validate) {
              isValid = await rule.validate(value);
            }
            break;
        }

        if (!isValid) {
          errors.push(rule.message);
        }
      } catch (error) {
        errors.push(`Validation error: ${error}`);
      }
    }

    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    };

    setValidation(result);
    setIsValidating(false);

    if (onValidationChange) {
      onValidationChange(result);
    }

    return result;
  }, [value, rules, onValidationChange]);

  // Clear validation
  const clearValidation = useCallback(() => {
    setValidation({
      isValid: true,
      errors: [],
      warnings: [],
    });
  }, []);

  // Validate on change if enabled
  useEffect(() => {
    if (validateOnChange) {
      validate();
    }
  }, [value, validateOnChange, validate]);

  return {
    validation,
    validate,
    clearValidation,
    isValidating,
  };
}