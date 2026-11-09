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

const appElement = globalThis.document?.querySelector<HTMLDivElement>('#app');
if (appElement) {
  // todo
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
      chars = '01';
      break;
    case Base.oct:
      chars = '01234567';
      break;
    case Base.dec:
      chars = '0123456789';
      break;
    case Base.hex:
      chars = '0123456789abcdef';
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

export function isValidGuess(value: number): boolean {
  console.log(value);
  return false;
}

export function createDigitValidator() {
 // todo
}

export function countPossibleSecrets() {
 // todo
}