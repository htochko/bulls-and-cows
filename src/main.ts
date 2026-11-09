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
   let bulls = 0;
  let cows = 0;

  const secretChars = secret.split('');
  const guessChars = guess.split('');

  // Подсчет быков
  for (let i = 0; i < guessChars.length; i++) {
    if (guessChars[i] === secretChars[i]) {
      bulls++;
      // исключение из поиска
      secretChars[i] = '_';
      guessChars[i] = 'X';
    }
  }

  // Подсчет коров
  for (let i = 0; i < guessChars.length; i++) {
    const char = guessChars[i];
    const secretIndex = secretChars.indexOf(char);
    if (secretIndex !== -1) {
      cows++;
      secretChars[secretIndex] = '_';
    }
  }

  return { bulls, cows };
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

export function createDigitValidator(base: Base, length: number) {
 return (guess: string): boolean => {
    return isValidGuess(guess, base, length);
  };
}

export function countPossibleSecrets(
  history: AttemptRecord[], 
  base: Base, 
  length: number
): number {
  const allSecrets = generateAllPossibleSecrets(base, length);
   
  const possible = allSecrets.filter(secret => {
    for (const record of history) {
      const simulation = evaluateGuess(record.guess, secret);
      if (
        simulation.bulls !== record.feedback.bulls || 
        simulation.cows !== record.feedback.cows
      ) {
        return false;
      }
    }
    return true;
  });

  return possible.length;
}

function generateAllPossibleSecrets(base: Base, length: number): string[] {
  let chars = '';
  switch (base) {
    case Base.bin: chars = BINARIES; break;
    case Base.oct: chars = OCTALS; break;
    case Base.dec: chars = DECIMALS; break;
    case Base.hex: chars = HEXS; break;
  }

  const results: string[] = [];

  function rearrange(current: string, available: string[]) {
    if (current.length === length) {
      results.push(current);
      return;
    }
    for (let i = 0; i < available.length; i++) {
      const nextAvailable = [...available];
      nextAvailable.splice(i, 1);
      rearrange(current + available[i], nextAvailable);
    }
  }

  rearrange('', chars.split(''));
  return results;
}