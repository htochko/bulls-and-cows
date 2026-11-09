import test from 'node:test';
import assert from 'node:assert';
import { setupApp } from '../src/main.ts';

test('setupApp renders correct content', () => {
  // Создаем простой мок HTMLElement для проверки логики
  const mockElement = { innerHTML: '' } as HTMLElement;
  
  setupApp(mockElement);
  
  assert.ok(mockElement.innerHTML.includes('Bools and cows'));
});