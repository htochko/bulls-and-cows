import { describe, it, expect } from 'vitest';
import { 
  generateSecret, 
  evaluateGuess, 
  isValidGuess, 
  createDigitValidator, 
  countPossibleSecrets 
} from '../src/main.ts';

describe('API & Methods check', () => {
  it('has all required methods and functions', () => {
    // Проверяем наличие и типы отдельных функций
    expect(typeof generateSecret).toBe('function');
    expect(typeof evaluateGuess).toBe('function');
    expect(typeof isValidGuess).toBe('function');
    expect(typeof createDigitValidator).toBe('function');
    expect(typeof countPossibleSecrets).toBe('function');
  });
});