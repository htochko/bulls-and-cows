export function setupApp(element: HTMLElement): void {
  element.innerHTML = `
    <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
      <h1>Bulls and cows</h1>
    </div>
  `;
}

const appElement = globalThis.document?.querySelector<HTMLDivElement>('#app');
if (appElement) {
  setupApp(appElement);
}
