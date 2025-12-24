import { useMemo } from 'react';
import type { TrueOrFalseConfig, ValidationRule } from '../../types';

export function useTrueOrFalseValidation(config: TrueOrFalseConfig): ValidationRule[] {
  return useMemo(() => {
    // Start with existing validation rules from config
    const rules: ValidationRule[] = [...(config.validation?.rules || [])];
    
    // Add correctness validation if correctAnswer is defined
    if (config.correctAnswer !== undefined) {
      // Check if user already added a correctness validation rule
      const hasCorrectnessValidation = rules.some(
        rule => rule.type === 'custom' && 
                (rule.message?.toLowerCase().includes('correct') ||
                 rule.message?.toLowerCase().includes('incorrect'))
      );
      
      // Only add if it doesn't already exist
      if (!hasCorrectnessValidation) {
        rules.push({
          type: 'custom',
          validate: (value: boolean) => {
            // Check if answer matches the correct answer
            return value === config.correctAnswer;
          },
          message: 'Incorrect answer',
        });
      }
    }
    
    return rules;
  }, [config]);
}