// ---------- js/interviewSimulator.js ----------
import { DataManager } from './dataManager.js';
import { Timer } from './timer.js';
import { SpeechController } from './speechController.js';
import { PreviewModal } from './previewModal.js';
import {
  STAGE_LABELS,
  APP_SETTINGS,
  PRACTICE_MODES,
  buildQueue,
  getRole,
  groupRolesBySector,
  questionsForRole
} from './config.js';

export default class InterviewSimulator {
  constructor() {
    this.dataMgr = new DataManager();
    this.datosAspirante = this.dataMgr.requireDataOrRedirect('index.html');
    if (!this.datosAspirante) return;

    this.rol = this.datosAspirante.rol || 'general';
    this.timePerQuestion = APP_SETTINGS.defaultTime;
    this.useVoice = APP_SETTINGS.useVoiceRecognition;
    this.modo = 'completa';

    this.queue = [];
    this.index = 0;
    this.respuestas = [];
    this.active = false;

    this._cacheDOM();

    this.speech = new SpeechController(this.ivw.voice, 'es-MX');
    this.speech.onResult = (text) => {
      if (text && this.active) {
        this.ivw.answer.value = text;
        this._refreshNextButton();
      }
    };
    this.timer = new Timer(this.ivw.timer, this.timePerQuestion, () => this._handleTimeout(), this.ivw.timerStatus);
    this.preview = new PreviewModal(this.previewModal.content, () => this.respuestas, this.datosAspirante);

    this._bindEvents();
    this._fillSetup();
    this._showSetup();
    this._renderUser();
  }

  // ---------- Referencias al DOM ----------
  _cacheDOM() {
    this.head = {
      userChip: document.getElementById('headerUser'),
      userName: document.getElementById('headerUserName'),
    };
    this.setup = {
      box: document.getElementById('setupCard'),
      role: document.getElementById('setupRole'),
      roleDesc: document.getElementById('setupRoleDesc'),
      summary: document.getElementById('setupSummary'),
      modes: Array.from(document.querySelectorAll('input[name="setupMode"]')),
      advancedHint: document.getElementById('setupAdvancedHint'),
      time: document.getElementById('setupTime'),
      voice: document.getElementById('setupVoice'),
      start: document.getElementById('btnStart'),
    };
    this.ivw = {
      box: document.getElementById('interviewArea'),
      stageSteps: document.getElementById('stageSteps'),
      progressFill: document.getElementById('progressFill'),
      progressLabel: document.getElementById('progressLabel'),
      question: document.getElementById('questionText'),
      timer: document.getElementById('timer'),
      timerStatus: document.getElementById('timerStatus'),
      answer: document.getElementById('txtAnswer'),
      next: document.getElementById('btnNext'),
      skip: document.getElementById('btnSkip'),
      voice: document.getElementById('btnVoice'),
      hint: document.getElementById('voiceHint'),
    };
    this.feedback = {
      box: document.getElementById('feedbackBox'),
      scoreNum: document.getElementById('fbScore'),
      scoreLabel: document.getElementById('fbScoreLabel'),
      meter: document.getElementById('fbMeter'),
      fortalezas: document.getElementById('fbFortalezas'),
      mejoras: document.getElementById('fbMejoras'),
      tip: document.getElementById('fbTip'),
      continue: document.getElementById('btnContinue'),
    };
    this.result = {
      box: document.getElementById('resultCard'),
      score: document.getElementById('resultScore'),
      caption: document.getElementById('resultCaption'),
      stageResults: document.getElementById('stageResults'),
      recap: document.getElementById('resultRecap'),
      preview: document.getElementById('btnPreview'),
      restart: document.getElementById('btnRestart'),
    };
    this.previewModal = {
      backdrop: document.getElementById('previewBackdrop'),
      close: document.getElementById('btnCloseModal'),
      close2: document.getElementById('btnCloseModal2'),
      content: document.getElementById('previewContent'),
    };
  }

  _bindEvents() {
    this.setup.start.addEventListener('click', () => this.startInterview());
    this.setup.role.addEventListener('change', () => this._syncRoleInfo());
    this.setup.modes.forEach((input) => {
      input.addEventListener('change', () => this._syncSetupSummary());
    });
    this.setup.time.addEventListener('change', () => this._syncSetupSummary());
    this.setup.voice.addEventListener('change', () => this._syncSetupSummary());

    this.ivw.next.addEventListener('click', () => this._submitAnswer());
    this.ivw.skip.addEventListener('click', () => this._skipQuestion());

    this.ivw.answer.addEventListener('input', () => this._refreshNextButton());
    this.ivw.answer.addEventListener('keydown', (e) => {
      // Enter hace salto de línea; Ctrl/Cmd + Enter envía la respuesta.
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this._submitAnswer();
      }
    });

    this.feedback.continue.addEventListener('click', () => this._advanceNow());

    this.result.preview.addEventListener('click', () => this._openPreview());
    this.result.restart.addEventListener('click', () => this._resetInterview());

    this.previewModal.close.addEventListener('click', () => this._closePreview());
    if (this.previewModal.close2) this.previewModal.close2.addEventListener('click', () => this._closePreview());
    this.previewModal.backdrop.addEventListener('click', (e) => {
      if (e.target === this.previewModal.backdrop) this._closePreview();
    });
    document.addEventListener('keydown', (e) => {
      if (this.previewModal.backdrop.hidden) return;

      if (e.key === 'Escape') {
        this._closePreview();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusables = this._modalFocusables();
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    window.addEventListener('beforeunload', (e) => {
      if (this.active) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }

  // ---------- Pantalla de configuración ----------
  _fillSetup() {
    const roleSelect = this.setup.role;
    roleSelect.innerHTML = '';
    groupRolesBySector().forEach((roles, sector) => {
      const group = document.createElement('optgroup');
      group.label = sector;

      roles.forEach((rol) => {
        const opt = document.createElement('option');
        opt.value = rol.id;
        opt.textContent = rol.label;
        group.appendChild(opt);
      });

      roleSelect.appendChild(group);
    });
    this.rol = getRole(this.rol).id;
    roleSelect.value = this.rol;

    const timeSelect = this.setup.time;
    timeSelect.innerHTML = '';
    APP_SETTINGS.timeOptions.forEach((secs) => {
      const opt = document.createElement('option');
      opt.value = secs;
      opt.textContent = `${secs} segundos por pregunta`;
      timeSelect.appendChild(opt);
    });
    timeSelect.value = APP_SETTINGS.defaultTime;

    const voiceToggle = this.setup.voice;
    voiceToggle.checked = this.useVoice;
    if (!this.speech.supported) {
      voiceToggle.checked = false;
      voiceToggle.disabled = true;
      const label = voiceToggle.parentElement?.querySelector('.lbl small');
      if (label) label.textContent = 'Requiere micrófono y un navegador compatible.';
    }

    this.modo = this._getMode();
    this._syncRoleInfo();
  }

  _getMode() {
    const checked = this.setup.modes.find((input) => input.checked);
    return checked ? checked.value : 'completa';
  }

  _syncRoleInfo() {
    const rol = getRole(this.setup.role.value);

    if (this.setup.roleDesc) {
      this.setup.roleDesc.textContent = rol.desc;
    }
    this._syncSetupSummary();
  }

  _syncSetupSummary() {
    const rol = getRole(this.setup.role.value);
    const modo = this._getMode();
    const secs = this.setup.time.value;

    if (this.setup.summary) {
      const time = secs ? `${secs} s por pregunta` : 'tiempo por definir';
      this.setup.summary.textContent = `${questionsForRole(rol, modo)} preguntas · 3 etapas · ${time}`;
    }

    if (this.setup.advancedHint) {
      this.setup.advancedHint.textContent = !this.speech.supported
        ? 'Dictado no disponible'
        : this.setup.voice.checked ? 'Dictado activado' : 'Dictado desactivado';
    }
  }

  _showSetup() {
    this._show(this.setup.box);
    this._hide(this.ivw.box, this.feedback.box, this.result.box);
    this.ivw.question.textContent = '';
    this.ivw.answer.value = '';
    this._hide(this.feedback.box);
  }

  _renderUser() {
    if (this.head.userChip && this.head.userName) {
      this.head.userName.textContent = `${this.datosAspirante.nombre} ${this.datosAspirante.apellidos}`.trim();
    }
  }

  // ---------- Inicio de la entrevista ----------
  startInterview() {
    this.rol = this.setup.role.value || 'general';
    this.timePerQuestion = Number(this.setup.time.value) || APP_SETTINGS.defaultTime;
    this.modo = this._getMode();
    this.useVoice = this.setup.voice.checked && this.speech.supported;

    this.timer.duration = this.timePerQuestion;

    const rol = getRole(this.rol);
    this.queue = buildQueue(rol, this.modo);
    this.index = 0;
    this.respuestas = [];

    this.preview = new PreviewModal(this.previewModal.content, () => this.respuestas, this.datosAspirante);

    this.active = true;

    this._hide(this.setup.box, this.result.box);
    this._show(this.ivw.box);
    this._setInteractive(true);
    this._renderQuestion();
  }

  // ---------- Preguntas ----------
  _renderQuestion() {
    if (this.index >= this.queue.length) {
      this._endInterview();
      return;
    }

    const item = this.queue[this.index];
    this._renderStageSteps(item.modo);
    this.ivw.question.textContent = item.pregunta;

    const total = this.queue.length;
    const current = Math.min(this.index + 1, total);
    this.ivw.progressLabel.textContent =
      `Pregunta ${current} de ${total} · ${STAGE_LABELS[item.modo] || 'General'}`;
    this.ivw.progressFill.style.width = `${Math.round((current / total) * 100)}%`;

    this.ivw.answer.value = '';
    this._hide(this.feedback.box);
    this._setHint('');
    this._refreshNextButton();

    this.timer.reset();
    this.timer.start();

    if (window.matchMedia('(min-width: 861px)').matches) {
      this.ivw.answer.focus({ preventScroll: true });
    }
  }

  _renderStageSteps(mode) {
    if (!this.ivw.stageSteps) return;

    const order = ['intro', 'tecnicas', 'blandas'];
    const current = order.indexOf(mode);

    Array.from(this.ivw.stageSteps.children).forEach((step) => {
      const index = order.indexOf(step.dataset.stage);
      const isCurrent = index === current;
      step.classList.toggle('is-done', index < current);
      step.classList.toggle('is-current', isCurrent);
      if (isCurrent) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
  }

  _submitAnswer() {
    if (!this.active) return;
    const text = this.ivw.answer.value.trim();
    if (!text) {
      this._setHint('Escribe tu respuesta o usa el botón "Hablar" para dictarla.');
      return;
    }

    this.speech.stopRecognition();
    this.timer.stop();
    this._setInteractive(false);

    this._setHint('Analizando tu respuesta…');

    this._fetchFeedback(text)
      .then((feedback) => {
        const item = this.queue[this.index];
        this.respuestas.push({
          modo: item.modo,
          etapa: STAGE_LABELS[item.modo] || 'General',
          pregunta: item.pregunta,
          respuesta: text,
          feedback,
          score: feedback.score
        });
        this.index++;

        this._renderFeedback(feedback);
      })
      .catch((err) => {
        console.error(err);
        this._setHint('');
        this._setInteractive(true);
        this.timer.start();
        this._showError(this._feedbackErrorMessage(err));
      });
  }

  _handleTimeout() {
    if (!this.active) return;

    // Con texto, se envía sola. Sin texto, se evita el bloqueo silencioso en 0 s.
    if (this.ivw.answer.value.trim()) {
      this._submitAnswer();
      return;
    }

    this._setHint('Se acabó el tiempo. Escribe una última idea o pulsa "Omitir pregunta".');
    if (window.matchMedia('(min-width: 861px)').matches) {
      this.ivw.answer.focus({ preventScroll: true });
    }
  }

  _skipQuestion() {
    if (!this.active) return;
    this.timer.stop();
    this.index++;
    this._setHint('');
    this._renderQuestion();
  }

  // ---------- Feedback ----------
  _renderFeedback(fb) {
    const f = fb && typeof fb === 'object' ? fb : { fortalezas: [], mejoras: [], tip: 'Respuesta registrada.', score: 3 };

    this.feedback.scoreNum.textContent = `${f.score ?? 3}/5`;
    this.feedback.scoreLabel.textContent = this._scoreLabel(f.score);
    this._renderScoreMeter(Number(f.score) || 0);

    // Fortalezas
    this.feedback.fortalezas.innerHTML = '';
    (f.fortalezas || []).forEach((t) => {
      const li = document.createElement('li');
      li.textContent = t;
      this.feedback.fortalezas.appendChild(li);
    });

    // Mejoras
    this.feedback.mejoras.innerHTML = '';
    (f.mejoras || []).forEach((t) => {
      const li = document.createElement('li');
      li.textContent = t;
      this.feedback.mejoras.appendChild(li);
    });

    // Tip
    const tipP = document.createElement('p');
    tipP.textContent = f.tip || '';
    this.feedback.tip.innerHTML = '';
    this.feedback.tip.appendChild(tipP);

    this._show(this.feedback.box);
    this._setHint('');

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(() => {
      this.feedback.box.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  }

  _renderScoreMeter(score) {
    if (!this.feedback.meter) return;

    const rounded = Math.max(0, Math.min(5, Math.round(score)));
    this.feedback.meter.innerHTML = '';

    for (let i = 1; i <= 5; i++) {
      const segment = document.createElement('span');
      segment.className = i <= rounded ? 'is-on' : '';
      this.feedback.meter.appendChild(segment);
    }
  }

  _advanceNow() {
    if (!this.active) return;
    this._setInteractive(true);
    this._renderQuestion();

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.ivw.box.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start'
    });
  }

  // ---------- Fin e informes ----------
  _endInterview() {
    this.active = false;
    this.timer.stop();
    this.speech.stopRecognition();

    this._hide(this.ivw.box, this.feedback.box);
    this._show(this.result.box);

    const scored = this.respuestas.filter((item) => typeof item.score === 'number');
    const avg = scored.length
      ? scored.reduce((acc, item) => acc + item.score, 0) / scored.length
      : 0;

    this.result.score.textContent = scored.length ? `${avg.toFixed(1)} / 5` : '—';
    const modo = PRACTICE_MODES[this.modo] || PRACTICE_MODES.completa;
    this.result.caption.textContent = scored.length
      ? `${modo.label}: ${this._scoreLabel(avg)}. Revisa tus respuestas en el informe.`
      : 'No hubo respuestas evaluadas. Practica de nuevo para obtener tu puntuación.';

    this._renderStageResults();
    this._renderRecap();
  }

  _renderStageResults() {
    this.result.stageResults.innerHTML = '';
    const stageKeys = ['intro', 'tecnicas', 'blandas'];

    stageKeys.forEach((key) => {
      const items = this.respuestas.filter((item) => item.modo === key && typeof item.score === 'number');
      if (!items.length) return;
      const avg = items.reduce((acc, item) => acc + item.score, 0) / items.length;

      const row = document.createElement('div');
      row.className = 'stage-result';

      const top = document.createElement('div');
      top.className = 'top';
      const name = document.createElement('span');
      name.textContent = STAGE_LABELS[key] || key;
      const val = document.createElement('span');
      val.textContent = `${avg.toFixed(1)} / 5`;
      top.append(name, val);
      row.appendChild(top);

      const track = document.createElement('div');
      track.className = 'track';
      const fill = document.createElement('div');
      fill.className = 'fill';
      fill.style.width = `${(avg / 5) * 100}%`;
      track.appendChild(fill);
      row.appendChild(track);

      this.result.stageResults.appendChild(row);
    });

    if (!this.result.stageResults.childElementCount) {
      const p = document.createElement('p');
      p.className = 'muted mb-0';
      p.textContent = 'Sin datos por etapa.';
      this.result.stageResults.appendChild(p);
    }
  }

  // ---------- Resumen de fortalezas ----------
  _renderRecap() {
    const box = this.result.recap;
    if (!box) return;

    box.innerHTML = '';
    const phrases = [];

    this.respuestas.forEach((item) => {
      const fortalezas = item.feedback && Array.isArray(item.feedback.fortalezas)
        ? item.feedback.fortalezas
        : [];
      const score = Number(item.score);
      const seen = new Set();

      fortalezas.forEach((raw) => {
        const text = String(raw || '').trim();
        if (!text) return;

        const key = this._normalizePhrase(text);
        if (!key || seen.has(key)) return;
        seen.add(key);
        phrases.push({ text, key, score: Number.isFinite(score) ? score : 0 });
      });
    });

    if (!phrases.length) {
      box.hidden = true;
      return;
    }

    const groups = new Map();
    phrases.forEach((entry) => {
      if (!groups.has(entry.key)) {
        groups.set(entry.key, { text: entry.text, count: 0, best: 0 });
      }
      const group = groups.get(entry.key);
      group.count += 1;
      group.best = Math.max(group.best, entry.score);
    });

    const top = [...groups.values()]
      .sort((a, b) => b.count - a.count || b.best - a.best || a.text.localeCompare(b.text, 'es'))
      .slice(0, 4);

    const heading = document.createElement('h3');
    heading.textContent = 'Fortalezas destacadas';
    box.appendChild(heading);

    const note = document.createElement('p');
    note.className = 'muted';
    note.textContent = top.some((item) => item.count > 1)
      ? 'Las que más se repiten en tus respuestas.'
      : 'Los puntos fuertes mejor valorados de esta sesión.';
    box.appendChild(note);

    const list = document.createElement('ul');
    top.forEach((item) => {
      const li = document.createElement('li');
      const text = document.createElement('span');
      text.textContent = item.text;
      li.appendChild(text);

      if (item.count > 1) {
        const count = document.createElement('span');
        count.className = 'recap-count';
        count.textContent = `×${item.count}`;
        count.setAttribute('aria-label', `Aparece en ${item.count} respuestas`);
        li.appendChild(count);
      }
      list.appendChild(li);
    });

    box.appendChild(list);
    box.hidden = false;
  }

  _normalizePhrase(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  _modalFocusables() {
    const selector =
      'a[href], button:not([disabled]), summary, input, select, textarea, [tabindex]:not([tabindex="-1"])';

    return Array.from(this.previewModal.backdrop.querySelectorAll(selector)).filter(
      (el) => !el.hidden && el.offsetParent !== null
    );
  }

  _setBackgroundInert(inert) {
    document.querySelectorAll('body > header, body > main, body > footer').forEach((el) => {
      if (inert) el.setAttribute('inert', '');
      else el.removeAttribute('inert');
    });
  }

  _openPreview() {
    this._lastFocused = document.activeElement;
    this.preview.show();
    this.previewModal.backdrop.hidden = false;
    document.body.classList.add('modal-open');
    this._setBackgroundInert(true);

    const first = this._modalFocusables()[0] || this.previewModal.close;
    if (first) first.focus();
  }

  _closePreview() {
    if (this.previewModal.backdrop.hidden) return;
    this.previewModal.backdrop.hidden = true;
    document.body.classList.remove('modal-open');
    this._setBackgroundInert(false);
    const target = this._lastFocused || this.result.preview;
    if (target && typeof target.focus === 'function') target.focus({ preventScroll: true });
  }

  _resetInterview() {
    this.active = false;
    this.timer.stop();
    this.speech.stopRecognition();
    document.body.classList.remove('modal-open');
    this._setBackgroundInert(false);
    this.respuestas = [];
    this.queue = [];
    this.index = 0;
    if (this.result.recap) this.result.recap.hidden = true;
    this._showSetup();
    this._setInteractive(false);
  }

  // ---------- Backend ----------
  async _fetchFeedback(answer) {
    const item = this.queue[this.index];
    const payload = {
      answer,
      question: item.pregunta
    };

    const urls = [APP_SETTINGS.apiPrimary, APP_SETTINGS.apiFallback].filter(Boolean);
    let lastError = null;

    for (const url of urls) {
      try {
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!resp.ok) {
          const error = new Error(`HTTP ${resp.status}`);
          error.status = resp.status;
          throw error;
        }
        return await resp.json();
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError || new Error('Backend no disponible');
  }

  // ---------- Utilidades ----------
  _feedbackErrorMessage(err) {
    const status = err && err.status;

    if (status === 429) {
      return 'Has enviado muchas respuestas seguidas. Espera un minuto y vuelve a intentarlo.';
    }
    if (status === 504) {
      return 'El análisis tardó demasiado. Inténtalo de nuevo.';
    }
    if (status === 400 || status === 413) {
      return 'La respuesta es demasiado larga. Acórtala y vuelve a intentarlo.';
    }
    return 'No se pudo analizar la respuesta. Revisa tu conexión e intenta de nuevo.';
  }

  _scoreLabel(score) {
    const key = Math.round(Number(score) || 0);
    const map = {
      5: 'Excelente',
      4: 'Muy bien',
      3: 'Aceptable',
      2: 'Necesitas preparar más',
      1: 'En progreso',
      0: 'Sin evaluar'
    };
    return map[key] || map[0];
  }

  _setInteractive(enabled) {
    this._interactive = enabled;
    this.ivw.answer.disabled = !enabled;
    this.ivw.skip.disabled = !enabled;
    this.ivw.voice.disabled = !enabled || !this.useVoice;
    this.ivw.answer.placeholder = enabled
      ? 'Escribe o dicta tu respuesta aquí…'
      : 'Inicia la entrevista para escribir.';
    this._refreshNextButton();
  }

  _refreshNextButton() {
    this.ivw.next.disabled = !this._interactive || !this.ivw.answer.value.trim();
  }

  _setHint(msg) {
    if (this.ivw.hint) this.ivw.hint.textContent = msg || '';
  }

  _showError(msg) {
    const el = document.getElementById('feedbackError');
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    setTimeout(() => { el.hidden = true; }, 6000);
  }

  _show(...els) { els.forEach((el) => { if (el) el.hidden = false; }); }
  _hide(...els) { els.forEach((el) => { if (el) el.hidden = true; }); }
}