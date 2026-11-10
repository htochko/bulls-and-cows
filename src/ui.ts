import { Base, generateSecret, evaluateGuess, createDigitValidator, countPossibleSecrets, AttemptRecord } from './main.ts';

export interface WinnerRecord {
    attempts: number,
    timeSeconds: number,
    base: string,
    length: number,
    date: string
}

// Состояние игры
let currentBase = Base.dec;
let currentLength = 4;
let secretCode = '';
let attemptHistory: AttemptRecord[] = [];
let startTime: number | null = null;
let timerInterval: number | null = null;
let isGameActive = false;
let secondsElapsed = 0;

const appContainer = document.getElementById('app') as HTMLElement;

// Функция рендеринга всего интерфейса в #app
function render() {
  appContainer.innerHTML = `
    <div class="game-container">
      <header>
        <h1>Быки и Коровы</h1>
        <p class="subtitle">Логическая игра с выбором систем счисления</p>
      </header>

      ${!isGameActive ? renderSettings() : renderGamePlay()}

      <section class="leaderboard-panel">
        <h3>Таблица рекордов (Top 5)</h3>
        <ul id="leaderboard-list">
          ${renderLeaderboardItems()}
        </ul>
      </section>
    </div>
  `;

  attachEventListeners();
}

function renderSettings() {
  return `
    <section class="settings-panel" id="settings-panel">
      <div class="control-group">
        <label for="base-select">Система счисления:</label>
        <select id="base-select">
          <option value="10" ${currentBase === Base.dec ? 'selected' : ''}>Десятичная (dec)</option>
          <option value="2" ${currentBase === Base.bin ? 'selected' : ''}>Двоичная (bin)</option>
          <option value="8" ${currentBase === Base.oct ? 'selected' : ''}>Восьмеричная (oct)</option>
          <option value="16" ${currentBase === Base.hex ? 'selected' : ''}>Шестнадцатеричная (hex)</option>
        </select>
      </div>

      <div class="control-group">
        <label for="length-select">Длина секрета:</label>
        <select id="length-select" ${currentBase === Base.bin ? 'disabled' : ''}>
          <option value="2" ${currentLength === 2 ? 'selected' : ''}>2</option>
          <option value="3" ${currentLength === 3 ? 'selected' : ''}>3</option>
          <option value="4" ${currentLength === 4 ? 'selected' : ''}>4</option>
          <option value="5" ${currentLength === 5 ? 'selected' : ''}>5</option>
          <option value="6" ${currentLength === 6 ? 'selected' : ''}>6</option>
        </select>
      </div>

      <button id="start-btn" class="btn primary">Начать игру</button>
    </section>
  `;
}

function renderGamePlay() {
  const possible = countPossibleSecrets(attemptHistory, currentBase, currentLength);
  const mins = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
  const secs = (secondsElapsed % 60).toString().padStart(2, '0');

  return `
    <section class="game-play-panel" id="game-play-panel">
      <div class="game-status-bar">
        <span>Попыток: <strong>${attemptHistory.length}</strong></span>
        <span>Время: <strong>${mins}:${secs}</strong></span>
        <span>Возможных вариантов: <strong>${possible}</strong></span>
      </div>

      <div class="input-group">
        <input type="text" id="guess-input" placeholder="Введите ваш вариант..." autocomplete="off">
        <button id="submit-guess-btn" class="btn primary" disabled>Угадать</button>
      </div>
      <p class="error-msg" id="error-msg"></p>

      <div class="history-container">
        <h3>История ходов</h3>
        <ul id="history-list">
          ${[...attemptHistory].reverse().map((item, index) => `
            <li class="history-item">
              <span class="history-guess">#${attemptHistory.length - index}: <strong>${item.guess}</strong></span>
              <span class="history-feedback">🐂 Быки: ${item.feedback.bulls} | 🐄 Коровы: ${item.feedback.cows}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <button id="restart-btn" class="btn secondary">Сдаться / Новая игра</button>
    </section>
  `;
}

function renderLeaderboardItems() {
  const stored = localStorage.getItem('bulls_cows_leaderboard');
  if (!stored) return '<li class="empty-record">Пока нет завершенных игр</li>';

  const records: WinnerRecord[] = JSON.parse(stored);
  if (records.length === 0) return '<li class="empty-record">Пока нет завершенных игр</li>';

  return records.map((rec, idx) => `
    <li class="leaderboard-item">
      <span>#${idx + 1} | База: ${rec.base} (${rec.length} зн.)</span>
      <span>${rec.attempts} поп. за ${rec.timeSeconds}с</span>
    </li>
  `).join('');
}

// Привязка интерактивных событий после рендеринга
function attachEventListeners() {
  const baseSelect = document.getElementById('base-select') as HTMLSelectElement;
  const lengthSelect = document.getElementById('length-select') as HTMLSelectElement;
  const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
  const guessInput = document.getElementById('guess-input') as HTMLInputElement;
  const submitBtn = document.getElementById('submit-guess-btn') as HTMLButtonElement;
  const errorMsg = document.getElementById('error-msg') as HTMLElement;
  const restartBtn = document.getElementById('restart-btn') as HTMLButtonElement;

  if (baseSelect) {
    baseSelect.addEventListener('change', () => {
      currentBase = Number(baseSelect.value) as Base;
      if (currentBase === Base.bin) {
        currentLength = 2;
      }
      render();
    });
  }

  if (lengthSelect) {
    lengthSelect.addEventListener('change', () => {
      currentLength = Number(lengthSelect.value);
    });
  }

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      secretCode = generateSecret(currentBase, currentLength, Math.random);
      attemptHistory = [];
      isGameActive = true;
      secondsElapsed = 0;

      startTimer();
      render();
    });
  }

  if (guessInput) {
    const validateGuessFn = createDigitValidator(currentBase)(currentLength);

    guessInput.focus();

    guessInput.addEventListener('input', () => {
      const val = guessInput.value;
      const isValid = validateGuessFn(val);
      
      if (submitBtn) submitBtn.disabled = !isValid;
      if (!isValid && val.length > 0) {
        errorMsg.textContent = 'Неверный формат, длина или есть повторяющиеся цифры!';
      } else {
        errorMsg.textContent = '';
      }
    });

    guessInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && submitBtn && !submitBtn.disabled) {
        handleAttempt(guessInput.value.trim());
      }
    });

    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        handleAttempt(guessInput.value.trim());
      });
    }
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      if (confirm('Сдаться и начать новую игру?')) {
        endGame(false);
      }
    });
  }
}

function handleAttempt(guess: string) {
  const validateGuessFn = createDigitValidator(currentBase)(currentLength);
  if (!validateGuessFn(guess)) return;

  const feedback = evaluateGuess(guess, secretCode);
  attemptHistory = [...attemptHistory, { guess, feedback }];

  if (feedback.bulls === currentLength) {
    endGame(true);
  } else {
    render();
  }
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  startTime = Date.now(); // Используем startTime
  secondsElapsed = 0;

  timerInterval = window.setInterval(() => {
    if (!startTime) return;
    
    // Прошедшее время на основе startTime
    secondsElapsed = Math.floor((Date.now() - startTime) / 1000);

    // Обновление mins и secs
    const timerDisplayEl = document.querySelector('.game-status-bar strong:nth-child(2)') as HTMLElement;
    if (timerDisplayEl) {
      const mins = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
      const secs = (secondsElapsed % 60).toString().padStart(2, '0');
      timerDisplayEl.textContent = `${mins}:${secs}`;
    }
  }, 1000);
}

function endGame(isVictory: boolean) {
  isGameActive = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  if (isVictory) {
    alert(`🎉 Победа! Вы угадали секрет "${secretCode}" за ${attemptHistory.length} попыток и ${Math.floor(secondsElapsed / 60)} мин ${secondsElapsed % 60} сек!`);
    saveScore(attemptHistory.length, secondsElapsed, currentBase, currentLength);
  } else {
    alert(`Игра окончена. Загаданный секрет был: ${secretCode}`);
  }

  render();
}

function saveScore(attempts: number, timeSeconds: number, base: Base, length: number) {
  const newRecord: WinnerRecord = {
    attempts,
    timeSeconds,
    base: Base[base],
    length,
    date: new Date().toLocaleDateString()
  };

  const stored = localStorage.getItem('bulls_cows_leaderboard');
  const records: WinnerRecord[] = stored ? JSON.parse(stored) : [];
  
  records.push(newRecord);
  records.sort((a, b) => a.attempts - b.attempts || a.timeSeconds - b.timeSeconds);
  
  const top5 = records.slice(0, 5);
  localStorage.setItem('bulls_cows_leaderboard', JSON.stringify(top5));
}

// Первичный запуск отрисовки
render();