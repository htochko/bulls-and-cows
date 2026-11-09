import { describe, it, expect } from 'vitest';
import { 
  generateSecret, 
  evaluateGuess, 
  isValidGuess, 
  createDigitValidator, 
  countPossibleSecrets,
  Base, GuessResult 
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

describe('generateSecret', () => {
  it('генерирует бинарный секрет корректной длины (2-6)', () => {
    const secret = generateSecret(2, 2); // 
    expect(typeof secret).toBe('string');
    expect(secret.length).toBe(2);
    // Должен состоять только из нулей и единиц
    expect(/^[01]+$/.test(secret)).toBe(true);
  });

  it('генерирует восьмеричный (oct) секрет корректной длины', () => {
    const secret = generateSecret(8, 3);
    expect(secret.length).toBe(3);
    // Должен состоять только из цифр от 0 до 7
    expect(/^[0-7]+$/.test(secret)).toBe(true);
  });

  it('генерирует десятичный (decimal) секрет и проверяет уникальность цифр (если требуется)', () => {
    const secret = generateSecret(10, 5);
    expect(secret.length).toBe(5);
    expect(/^[0-9]+$/.test(secret)).toBe(true);
  });

  it('генерирует шестнадцатеричный (hex) секрет корректной длины', () => {
    const secret = generateSecret(16, 6);
    expect(secret.length).toBe(6);
    expect(/^[0-9a-fA-F]+$/.test(secret)).toBe(true);
  });

  it('успешно работает для всех допустимых длин от 2 до 6 знаков', () => {
    const lengths = [2, 3, 4, 5, 6] as const;
    
    lengths.forEach((len) => {
      const secret = generateSecret(10, len);
      expect(secret.length).toBe(len);
    });
  });
});

describe('generateSecret constraints', () => {
  it('выбрасывает ошибку, если для binary выбрана длина не равная 2', () => {
    // Проверяем, что передача длины 3, 4 и т.д. для binary вызовет ошибку
    expect(() => generateSecret(Base.bin, 3)).toThrow();
    expect(() => generateSecret(Base.bin, 4)).toThrow();
    expect(() => generateSecret(Base.bin, 5)).toThrow();
    expect(() => generateSecret(Base.bin, 6)).toThrow();
  });
});

describe('generateSecret с детерминированным random', () => {
  it('генерирует предсказуемый секрет при фиксированном источнике случайности', () => {
  
    const mockRandom = () => 0.1;

    const secret = generateSecret(Base.dec, 3, mockRandom);
    
    expect(secret).toBe('923'); // значение при детерминированном перемешивании
  });
});

// evaluateGuess
describe('evaluateGuess (по принципу FIRST)', () => {
  
  it('F (Fast) & S (Self-validating): мгновенно возвращает 4 быка при абсолютно точном совпадении', () => {
    const secret = '1234';
    const guess = '1234';
    
    const result = evaluateGuess(guess, secret);
    
    expect(result).toEqual({ bulls: 4, cows: 0 });
  });

  it('I (Independent): корректно считает только коров, когда все цифры угаданы, но стоят не на своих местах', () => {
    const secret = '1234';
    const guess = '4321'; // Все цифры есть, но позиции перепутаны
    
    const result = evaluateGuess(guess, secret);
    
    expect(result).toEqual({ bulls: 0, cows: 4 });
  });

  it('R (Repeatable): выдает предсказуемый смешанный результат (быки + коровы) при многократных запусках', () => {
    const secret = '1234';
    const guess = '1324'; // '1' и '4' — на своих местах (быки), '3' и '2' — не на своих (коровы)
    
    const result = evaluateGuess(guess, secret);
    
    expect(result).toEqual({ bulls: 2, cows: 2 });
  });

  it('I (Independent): возвращает нули при полном отсутствии совпадений', () => {
    const secret = '1234';
    const guess = '5678';
    
    const result = evaluateGuess(guess, secret);
    
    expect(result).toEqual({ bulls: 0, cows: 0 });
  });

  it('S (Self-validating): корректно обрабатывает частичные пересечения в других системах счисления (например, hex)', () => {
    const secret = 'a1b2';
    const guess = 'a2b1'; // 'a' и 'b' на местах (2 быка), '1' и '2' переставлены (2 коровы)
    
    const result = evaluateGuess(guess, secret);
    
    expect(result).toEqual({ bulls: 2, cows: 2 });
  });

});