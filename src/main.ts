export function setupApp(element: HTMLElement): void {
  element.innerHTML = `
    <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
      <h1>Bulls and cows</h1>
    </div>
  `;
}

export enum Base { bin = 2, oct = 8,  dec = 10, hex = 16 }

const appElement = globalThis.document?.querySelector<HTMLDivElement>('#app');
if (appElement) {
  // todo
}

export function generateSecret(base: Base, length: number, random: () => number = Math.random): string {
  // todo
}

export function evaluateGuess(value: number) {
   // todo
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