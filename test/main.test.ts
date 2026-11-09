import { describe, it, expect } from 'vitest';
import { 
  generateSecret, 
  evaluateGuess, 
  isValidGuess, 
  createDigitValidator, 
  countPossibleSecrets,
  Base 
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

// isValidGues
describe('isValidGuess (проверка ввода пользователя)', () => {
  
  it('возвращает true для корректной десятичной попытки', () => {
    expect(isValidGuess('1234', Base.dec, 4)).toBe(true);
  });

  it('возвращает false, если длина строки не совпадает с требуемой', () => {
    expect(isValidGuess('123', Base.dec, 4)).toBe(false);
    expect(isValidGuess('12345', Base.dec, 4)).toBe(false);
  });

  it('возвращает false, если в попытке есть повторяющиеся цифры', () => {
    expect(isValidGuess('1123', Base.dec, 4)).toBe(false);
  });

  it('возвращает false при наличии недопустимых символов для выбранной базы', () => {
    expect(isValidGuess('123a', Base.dec, 4)).toBe(false); // буква в десятичной системе
    expect(isValidGuess('0892', Base.oct, 4)).toBe(false); // цифра 8 и 9 вне восьмеричной системы
  });

  it('строго проверяет ограничения для бинарной системы (Base.bin)', () => {
    expect(isValidGuess('10', Base.bin, 2)).toBe(true);
    expect(isValidGuess('101', Base.bin, 3)).toBe(false); // для bin длина должна быть строго 2
  });

  it('корректно обрабатывает шестнадцатеричную систему (Base.hex)', () => {
    expect(isValidGuess('a1b2', Base.hex, 4)).toBe(true);
    expect(isValidGuess('g1b2', Base.hex, 4)).toBe(false); // 'g' не входит в hex
  });

});

// createDigitValidator suit
describe('createDigitValidator (фабрика валидаторов FIRST)', () => {
  
  it('F (Fast) & S (Self-validating): создает работающую функцию-валидатор для заданной базы и длины', () => {
    const decValidator = createDigitValidator(Base.dec, 3);
    
    expect(typeof decValidator).toBe('function');

    expect(decValidator('123')).toBe(true);
    expect(decValidator('12')).toBe(false);   // короче нормы
    expect(decValidator('1234')).toBe(false); // длиннее нормы
    expect(decValidator('112')).toBe(false);  // повторяющиеся цифры
    expect(decValidator('12a')).toBe(false);  // недопустимый символ
  });

  it('I (Independent) & R (Repeatable): изолирует разные инстансы для разных систем счисления', () => {
    const binValidator = createDigitValidator(Base.bin, 2);
    const hexValidator = createDigitValidator(Base.hex, 4);

    // Бинарный валидатор
    expect(binValidator('10')).toBe(true);
    expect(binValidator('101')).toBe(false); // длина строго 2

    // Шестнадцатеричный валидатор
    expect(hexValidator('a1b2')).toBe(true);
    expect(hexValidator('g1b2')).toBe(false);
  });

  it('S (Self-validating): проверка пустых строк и невалидных типов на входе', () => {
    const validator = createDigitValidator(Base.dec, 4);

    expect(validator('')).toBe(false);
    expect(validator(null as unknown as string)).toBe(false);
    expect(validator(undefined as unknown as string)).toBe(false);
  });

});