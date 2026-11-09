import test from 'node:test';
import assert from 'node:assert';
import { setupApp } from '../src/main.ts';

test('setupApp renders correct content', () => {
  // initial html
  const mockElement = { innerHTML: '' } as HTMLElement;
  
  setupApp(mockElement);
  
  assert.ok(mockElement.innerHTML.includes('Bulls and cows'));
});