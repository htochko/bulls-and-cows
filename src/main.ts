export function setupApp(element: HTMLElement): void {
  element.innerHTML = `
    <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
      <h1>Bool and cows</h1>
    </div>
  `;
}

const appElement = document.querySelector<HTMLDivElement>('#app');
if (appElement) {
  setupApp(appElement);
}