const BINARIES = '01';
const OCTALS = '01234567';
const DECIMALS = '0123456789';
const HEXS = '0123456789abcdf'

export function setupApp(element: HTMLElement): void {
  element.innerHTML = `
    <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
      <h1>Bulls and cows</h1>
    </div>
  `;
}

export enum Base { bin = 2, oct = 8,  dec = 10, hex = 16 }

export interface GuessResult {
  bulls: number;
  cows: number;
}

export interface AttemptRecord {
  guess: string;
  feedback: { bulls: number; cows: number };
}

const appElement = globalThis.document?.querySelector<HTMLDivElement>('#app');
if (appElement) {
  // todo UX here
}

export function generateSecret(base: Base, length: number, random: () => number = Math.random): string {
  if (length < 2 || length > 6) {
    throw new Error('Длина должна быть в диапазоне от 2 до 6 знаков.');
  }

  if (base === Base.bin && length !== 2) {
    throw new Error('Для двоичной системы доступна только длина 2');
  }

  let chars = '';
  switch (base) {
    case Base.bin:
      chars = BINARIES;
      break;
    case Base.oct:
      chars = OCTALS;
      break;
    case Base.dec:
      chars = DECIMALS;
      break;
    case Base.hex:
      chars = HEXS;
      break;
    default:
      throw new Error('Неподдерживаемая система счисления.');
  }

  if (length > chars.length) {
    throw new Error(`Длина ${length} превышает доступное количество уникальных символов для этой базы.`);
  }

  // Aлгоритмом Фишера-Йетса для переданного источника random
  const charArray = chars.split('');
  for (let i = charArray.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [charArray[i], charArray[j]] = [charArray[j], charArray[i]];
  }

  return charArray.slice(0, length).join('');
}

export function evaluateGuess(guess: string, secret: string):GuessResult {
  const guessChars = guess.split('');
  const secretChars = secret.split('');

  const nonBulls = guessChars.reduce(
    (acc, char, index) => {
      if (char === secretChars[index]) {
        return { ...acc, bulls: acc.bulls + 1 };
      }
      return {
        ...acc,
        guessUnmatched: [...acc.guessUnmatched, char],
        secretUnmatched: [...acc.secretUnmatched, secretChars[index]],
      };
    },
    { bulls: 0, guessUnmatched: [] as string[], secretUnmatched: [] as string[] }
  );

  const { cows } = nonBulls.guessUnmatched.reduce(
    (acc, char) => {
      const index = acc.secretUnmatched.indexOf(char);
      if (index !== -1) {
        acc.secretUnmatched.splice(index, 1);
        return { cows: acc.cows + 1, secretUnmatched: acc.secretUnmatched };
      }
      return acc;
    },
    { cows: 0, secretUnmatched: nonBulls.secretUnmatched }
  );

  return { bulls: nonBulls.bulls, cows };
}

export function isValidGuess(guess: string, base: Base, length: number): boolean {
  if (typeof guess !== 'string') {
    return false;
  }

  if (guess.length !== length) {
    return false;
  }

  if (base === Base.bin && length !== 2) {
    return false;
  }

  let regex: RegExp;
  switch (base) {
    case Base.bin:
      regex = /^[01]+$/;
      break;
    case Base.oct:
      regex = /^[0-7]+$/;
      break;
    case Base.dec:
      regex = /^[0-9]+$/;
      break;
    case Base.hex:
      regex = /^[0-9a-fA-F]+$/;
      break;
    default:
      return false;
  }

  if (!regex.test(guess)) {
    return false;
  }

  const uniqueChars = new Set(guess);
  if (uniqueChars.size !== guess.length) {
    return false;
  }

  return true;
}

//
export function createDigitValidator(base: Base) {
  return (length: number) => {
    return (guess: string): boolean => {
      return isValidGuess(guess, base, length);
    };
  };
}

export function countPossibleSecrets(
  history: AttemptRecord[], 
  base: Base, 
  length: number
): number {
  let chars = '';
  switch (base) {
    case Base.bin: chars = BINARIES; break;
    case Base.oct: chars = OCTALS; break;
    case Base.dec: chars = DECIMALS; break;
    case Base.hex: chars = HEXS; break;
  }

  const charArray = chars.split('');
  const memo = new Map<string, number>();

  function countValidRecursive(currentIndex: number, currentSecret: string, usedMask: number): number {
    if (currentSecret.length === length) {
      for (const record of history) {
        const simulation = evaluateGuess(record.guess, currentSecret);
        if (
          simulation.bulls !== record.feedback.bulls || 
          simulation.cows !== record.feedback.cows
        ) {
          return 0;
        }
      }
      return 1;
    }

    const memoKey = `${currentSecret}_${usedMask}`;
    if (memo.has(memoKey)) {
      return memo.get(memoKey)!;
    }

    let validCount = 0;

    for (let i = 0; i < charArray.length; i++) {
      if ((usedMask & (1 << i)) === 0) {
        const nextSecret = currentSecret + charArray[i];
        const nextMask = usedMask | (1 << i);

        validCount += countValidRecursive(currentIndex + 1, nextSecret, nextMask);
      }
    }

    memo.set(memoKey, validCount);
    return validCount;
  }

  return countValidRecursive(0, '', 0);
}