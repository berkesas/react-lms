import { useMemo } from 'react';
import type { ShortAnswerConfig, ValidationRule } from '../../types';

export function useShortAnswerValidation(config: ShortAnswerConfig): ValidationRule[] {
  return useMemo(() => {
    // Start with existing validation rules from config
    const rules: ValidationRule[] = [...(config.validation?.rules || [])];
    
    // Add correctness validation if correctAnswers provided
    if (config.correctAnswers && config.correctAnswers.length > 0) {
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
          validate: (value: string) => {
            // Empty values handled by 'required' rule
            if (!value) return false;
            
            // Apply trimming based on config
            const trimmedValue = config.trimWhitespace ? value.trim() : value;
            
            // Apply case sensitivity based on config
            const normalizedValue = config.caseSensitive 
              ? trimmedValue 
              : trimmedValue.toLowerCase();
            
            // Normalize correct answers the same way
            const normalizedCorrectAnswers = config.caseSensitive
              ? config.correctAnswers!
              : config.correctAnswers!.map(a => a.toLowerCase());
            
            // Check if answer matches any correct answer
            return normalizedCorrectAnswers.includes(normalizedValue);
          },
          message: 'Incorrect answer',
        });
      }
    }
    
    return rules;
  }, [config]);
}