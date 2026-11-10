(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`01`,t=`01234567`,n=`0123456789`,r=`0123456789abcdf`,i=function(e){return e[e.bin=2]=`bin`,e[e.oct=8]=`oct`,e[e.dec=10]=`dec`,e[e.hex=16]=`hex`,e}({});globalThis.document?.querySelector(`#app`);function a(i,a,o=Math.random){if(a<2||a>6)throw Error(`Длина должна быть в диапазоне от 2 до 6 знаков.`);if(i===2&&a!==2)throw Error(`Для двоичной системы доступна только длина 2`);let s=``;switch(i){case 2:s=e;break;case 8:s=t;break;case 10:s=n;break;case 16:s=r;break;default:throw Error(`Неподдерживаемая система счисления.`)}if(a>s.length)throw Error(`Длина ${a} превышает доступное количество уникальных символов для этой базы.`);let c=s.split(``);for(let e=c.length-1;e>0;e--){let t=Math.floor(o()*(e+1));[c[e],c[t]]=[c[t],c[e]]}return c.slice(0,a).join(``)}function o(e,t){let n=e.split(``),r=t.split(``),i=n.reduce((e,t,n)=>t===r[n]?{...e,bulls:e.bulls+1}:{...e,guessUnmatched:[...e.guessUnmatched,t],secretUnmatched:[...e.secretUnmatched,r[n]]},{bulls:0,guessUnmatched:[],secretUnmatched:[]}),{cows:a}=i.guessUnmatched.reduce((e,t)=>{let n=e.secretUnmatched.indexOf(t);return n===-1?e:(e.secretUnmatched.splice(n,1),{cows:e.cows+1,secretUnmatched:e.secretUnmatched})},{cows:0,secretUnmatched:i.secretUnmatched});return{bulls:i.bulls,cows:a}}function s(e,t,n){if(typeof e!=`string`||e.length!==n||t===2&&n!==2)return!1;let r;switch(t){case 2:r=/^[01]+$/;break;case 8:r=/^[0-7]+$/;break;case 10:r=/^[0-9]+$/;break;case 16:r=/^[0-9a-fA-F]+$/;break;default:return!1}return!(!r.test(e)||new Set(e).size!==e.length)}function c(e){return t=>n=>s(n,e,t)}function l(i,a,s){let c=``;switch(a){case 2:c=e;break;case 8:c=t;break;case 10:c=n;break;case 16:c=r}let l=c.split(``),u=new Map;function d(e,t,n){if(t.length===s){for(let e of i){let n=o(e.guess,t);if(n.bulls!==e.feedback.bulls||n.cows!==e.feedback.cows)return 0}return 1}let r=`${t}_${n}`;if(u.has(r))return u.get(r);let a=0;for(let r=0;r<l.length;r++)if(!(n&1<<r)){let i=t+l[r],o=n|1<<r;a+=d(e+1,i,o)}return u.set(r,a),a}return d(0,``,0)}var u=i.dec,d=4,f=``,p=[],m=null,h=null,g=!1,_=0,v=document.getElementById(`app`);function y(){v.innerHTML=`
    <div class="game-container">
      <header>
        <h1>Быки и Коровы</h1>
        <p class="subtitle">Логическая игра с выбором систем счисления</p>
      </header>

      ${g?x():b()}

      <section class="leaderboard-panel">
        <h3>Таблица рекордов (Top 5)</h3>
        <ul id="leaderboard-list">
          ${S()}
        </ul>
      </section>
    </div>
  `,C()}function b(){return`
    <section class="settings-panel" id="settings-panel">
      <div class="control-group">
        <label for="base-select">Система счисления:</label>
        <select id="base-select">
          <option value="10" ${u===i.dec?`selected`:``}>Десятичная (dec)</option>
          <option value="2" ${u===i.bin?`selected`:``}>Двоичная (bin)</option>
          <option value="8" ${u===i.oct?`selected`:``}>Восьмеричная (oct)</option>
          <option value="16" ${u===i.hex?`selected`:``}>Шестнадцатеричная (hex)</option>
        </select>
      </div>

      <div class="control-group">
        <label for="length-select">Длина секрета:</label>
        <select id="length-select" ${u===i.bin?`disabled`:``}>
          <option value="2" ${d===2?`selected`:``}>2</option>
          <option value="3" ${d===3?`selected`:``}>3</option>
          <option value="4" ${d===4?`selected`:``}>4</option>
          <option value="5" ${d===5?`selected`:``}>5</option>
          <option value="6" ${d===6?`selected`:``}>6</option>
        </select>
      </div>

      <button id="start-btn" class="btn primary">Начать игру</button>
    </section>
  `}function x(){let e=l(p,u,d),t=Math.floor(_/60).toString().padStart(2,`0`),n=(_%60).toString().padStart(2,`0`);return`
    <section class="game-play-panel" id="game-play-panel">
      <div class="game-status-bar">
        <span>Попыток: <strong>${p.length}</strong></span>
        <span>Время: <strong>${t}:${n}</strong></span>
        <span>Возможных вариантов: <strong>${e}</strong></span>
      </div>

      <div class="input-group">
        <input type="text" id="guess-input" placeholder="Введите ваш вариант..." autocomplete="off">
        <button id="submit-guess-btn" class="btn primary" disabled>Угадать</button>
      </div>
      <p class="error-msg" id="error-msg"></p>

      <div class="history-container">
        <h3>История ходов</h3>
        <ul id="history-list">
          ${[...p].reverse().map((e,t)=>`
            <li class="history-item">
              <span class="history-guess">#${p.length-t}: <strong>${e.guess}</strong></span>
              <span class="history-feedback">🐂 Быки: ${e.feedback.bulls} | 🐄 Коровы: ${e.feedback.cows}</span>
            </li>
          `).join(``)}
        </ul>
      </div>

      <button id="restart-btn" class="btn secondary">Сдаться / Новая игра</button>
    </section>
  `}function S(){let e=localStorage.getItem(`bulls_cows_leaderboard`);if(!e)return`<li class="empty-record">Пока нет завершенных игр</li>`;let t=JSON.parse(e);return t.length===0?`<li class="empty-record">Пока нет завершенных игр</li>`:t.map((e,t)=>`
    <li class="leaderboard-item">
      <span>#${t+1} | База: ${e.base} (${e.length} зн.)</span>
      <span>${e.attempts} поп. за ${e.timeSeconds}с</span>
    </li>
  `).join(``)}function C(){let e=document.getElementById(`base-select`),t=document.getElementById(`length-select`),n=document.getElementById(`start-btn`),r=document.getElementById(`guess-input`),o=document.getElementById(`submit-guess-btn`),s=document.getElementById(`error-msg`),l=document.getElementById(`restart-btn`);if(e&&e.addEventListener(`change`,()=>{u=Number(e.value),u===i.bin&&(d=2),y()}),t&&t.addEventListener(`change`,()=>{d=Number(t.value)}),n&&n.addEventListener(`click`,()=>{f=a(u,d,Math.random),p=[],g=!0,_=0,T(),y()}),r){let e=c(u)(d);r.focus(),r.addEventListener(`input`,()=>{let t=r.value,n=e(t);o&&(o.disabled=!n),!n&&t.length>0?s.textContent=`Неверный формат, длина или есть повторяющиеся цифры!`:s.textContent=``}),r.addEventListener(`keydown`,e=>{e.key===`Enter`&&o&&!o.disabled&&w(r.value.trim())}),o&&o.addEventListener(`click`,()=>{w(r.value.trim())})}l&&l.addEventListener(`click`,()=>{confirm(`Сдаться и начать новую игру?`)&&E(!1)})}function w(e){if(!c(u)(d)(e))return;let t=o(e,f);p=[...p,{guess:e,feedback:t}],t.bulls===d?E(!0):y()}function T(){h&&clearInterval(h),m=Date.now(),_=0,h=window.setInterval(()=>{if(!m)return;_=Math.floor((Date.now()-m)/1e3);let e=document.querySelector(`.game-status-bar strong:nth-child(2)`);e&&(e.textContent=`${Math.floor(_/60).toString().padStart(2,`0`)}:${(_%60).toString().padStart(2,`0`)}`)},1e3)}function E(e){g=!1,h&&=(clearInterval(h),null),e?(alert(`🎉 Победа! Вы угадали секрет "${f}" за ${p.length} попыток и ${Math.floor(_/60)} мин ${_%60} сек!`),D(p.length,_,u,d)):alert(`Игра окончена. Загаданный секрет был: ${f}`),y()}function D(e,t,n,r){let a={attempts:e,timeSeconds:t,base:i[n],length:r,date:new Date().toLocaleDateString()},o=localStorage.getItem(`bulls_cows_leaderboard`),s=o?JSON.parse(o):[];s.push(a),s.sort((e,t)=>e.attempts-t.attempts||e.timeSeconds-t.timeSeconds);let c=s.slice(0,5);localStorage.setItem(`bulls_cows_leaderboard`,JSON.stringify(c))}y();