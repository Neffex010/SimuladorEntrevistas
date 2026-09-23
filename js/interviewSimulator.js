// ---------- js/interviewSimulator.js ----------
import { DataManager } from './dataManager.js';
import { Timer } from './timer.js';
import { SpeechController } from './speechController.js';
import { PDFReportGenerator } from './pdfReportGenerator.js';
import { PreviewModal } from './previewModal.js';
import { ROLES, INTRO_QUESTIONS, SOFT_QUESTIONS, STAGE_LABELS, APP_SETTINGS, PDF_CONFIG } from './config.js';

const AUTO_ADVANCE_SECONDS = 12;

export default class InterviewSimulator {
  constructor() {
    this.dataMgr = new DataManager();
    this.datosAspirante = this.dataMgr.requireDataOrRedirect('index.html');
    if (!this.datosAspirante) return;

    this.rol = this.datosAspirante.rol || 'general';
    this.timePerQuestion = APP_SETTINGS.defaultTime;
    this.useSpeech = APP_SETTINGS.useQuestionSpeech;
    this.useVoice = APP_SETTINGS.useVoiceRecognition;

    this.queue = [];
    this.index = 0;
    this.respuestas = [];
    this.active = false;
    this._advanceTimer = null;
    this._advanceCount = 0;

    this._cacheDOM();

    this.speech = new SpeechController(this.ivw.voice, this.ivw.mute, 'es-MX');
    this.speech.onResult = (text) => {
      if (text && this.active) this.ivw.answer.value = text;
    };
    this.timer = new Timer(this.ivw.timer, this.timePerQuestion, () => {
      if (this.active) this._submitAnswer();
    });
    this.preview = new PreviewModal(this.previewModal.content, () => this.respuestas, this.datosAspirante);
    this.pdfGen = new PDFReportGenerator(this.respuestas, this.datosAspirante, PDF_CONFIG);

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
      time: document.getElementById('setupTime'),
      speech: document.getElementById('setupSpeech'),
      voice: document.getElementById('setupVoice'),
      start: document.getElementById('btnStart'),
    };
    this.ivw = {
      box: document.getElementById('interviewArea'),
      stage: document.getElementById('stageBadge'),
      stageName: document.getElementById('stageName'),
      progressFill: document.getElementById('progressFill'),
      progressLabel: document.getElementById('progressLabel'),
      question: document.getElementById('questionText'),
      timer: document.getElementById('timer'),
      answer: document.getElementById('txtAnswer'),
      next: document.getElementById('btnNext'),
      skip: document.getElementById('btnSkip'),
      voice: document.getElementById('btnVoice'),
      mute: document.getElementById('btnMute'),
      hint: document.getElementById('voiceHint'),
    };
    this.feedback = {
      box: document.getElementById('feedbackBox'),
      scoreNum: document.getElementById('fbScore'),
      scoreLabel: document.getElementById('fbScoreLabel'),
      fortalezas: document.getElementById('fbFortalezas'),
      mejoras: document.getElementById('fbMejoras'),
      tip: document.getElementById('fbTip'),
      advanceRow: document.getElementById('advanceRow'),
      advanceCount: document.getElementById('advanceCount'),
      continue: document.getElementById('btnContinue'),
    };
    this.result = {
      box: document.getElementById('resultCard'),
      score: document.getElementById('resultScore'),
      caption: document.getElementById('resultCaption'),
      stageResults: document.getElementById('stageResults'),
      preview: document.getElementById('btnPreview'),
      download: document.getElementById('btnDownload'),
      restart: document.getElementById('btnRestart'),
      home: document.getElementById('btnHome'),
    };
    this.previewModal = {
      backdrop: document.getElementById('previewBackdrop'),
      close: document.getElementById('btnCloseModal'),
      close2: document.getElementById('btnCloseModal2'),
      download: document.getElementById('btnDownloadModal'),
      content: document.getElementById('previewContent'),
    };
  }

  _bindEvents() {
    this.setup.start.addEventListener('click', () => this.startInterview());

    this.ivw.next.addEventListener('click', () => this._submitAnswer());
    this.ivw.skip.addEventListener('click', () => this._skipQuestion());

    this.ivw.answer.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this._submitAnswer();
      }
    });

    this.feedback.continue.addEventListener('click', () => this._advanceNow());

    this.result.preview.addEventListener('click', () => this._openPreview());
    this.result.download.addEventListener('click', () => this._downloadPdf());
    this.result.restart.addEventListener('click', () => this._resetInterview());
    this.result.home.addEventListener('click', () => {
      window.location.href = 'index.html';
    });

    this.previewModal.close.addEventListener('click', () => this._closePreview());
    if (this.previewModal.close2) this.previewModal.close2.addEventListener('click', () => this._closePreview());
    this.previewModal.download.addEventListener('click', () => this._downloadPdf());
    this.previewModal.backdrop.addEventListener('click', (e) => {
      if (e.target === this.previewModal.backdrop) this._closePreview();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.previewModal.backdrop.hidden) this._closePreview();
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
    ROLES.forEach((rol) => {
      const opt = document.createElement('option');
      opt.value = rol.id;
      opt.textContent = rol.label;
      roleSelect.appendChild(opt);
    });
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

    this.setup.speech.checked = this.useSpeech;

    const voiceToggle = this.setup.voice;
    voiceToggle.checked = this.useVoice;
    if (!this.speech.supported) {
      const label = voiceToggle.parentElement?.querySelector('.lbl small');
      if (label) label.textContent = 'Requiere micrófono y un navegador compatible.';
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
    this.useSpeech = this.setup.speech.checked;
    this.useVoice = this.setup.voice.checked;

    this.timer.duration = this.timePerQuestion;

    const rol = ROLES.find((item) => item.id === this.rol) || ROLES[0];
    this.queue = [
      ...INTRO_QUESTIONS.map((q) => ({ modo: 'intro', pregunta: q })),
      ...rol.tecnicas.map((q) => ({ modo: 'tecnicas', pregunta: q })),
      ...SOFT_QUESTIONS.map((q) => ({ modo: 'blandas', pregunta: q }))
    ];
    this.index = 0;
    this.respuestas = [];

    this.preview = new PreviewModal(this.previewModal.content, () => this.respuestas, this.datosAspirante);
    this.pdfGen = new PDFReportGenerator(this.respuestas, this.datosAspirante, PDF_CONFIG);

    this.active = true;

    this._hide(this.setup.box, this.result.box);
    this._show(this.ivw.box);
    this._setInteractive(true);
    this._renderQuestion();
  }

  // ---------- Preguntas ----------
  _renderQuestion() {
    this._clearAdvance();
    if (this.index >= this.queue.length) {
      this._endInterview();
      return;
    }

    const item = this.queue[this.index];
    this.ivw.stageName.textContent = STAGE_LABELS[item.modo] || 'General';
    this.ivw.question.textContent = item.pregunta;

    const total = this.queue.length;
    const current = Math.min(this.index + 1, total);
    this.ivw.progressLabel.textContent = `Pregunta ${current} de ${total}`;
    this.ivw.progressFill.style.width = `${Math.round((current / total) * 100)}%`;

    this.ivw.answer.value = '';
    this._hide(this.feedback.box);
    this._setHint('');

    this.timer.reset();
    this.timer.start();

    if (this.useSpeech) this.speech.speak(item.pregunta);
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
    this.ivw.next.disabled = true;
    this.ivw.skip.disabled = true;

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
        this._scheduleAdvance();
      })
      .catch((err) => {
        console.error(err);
        this._setHint('');
        this.ivw.next.disabled = false;
        this.ivw.skip.disabled = false;
        this._setInteractive(true);
        this.timer.start();
        this._showError('No se pudo analizar la respuesta. Revisa tu conexión e intenta de nuevo.');
      });
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
    this.ivw.answer.classList.add('fade-in');
  }

  _scheduleAdvance() {
    this._advanceCount = AUTO_ADVANCE_SECONDS;
    this._show(this.feedback.advanceRow);
    this.feedback.continue.disabled = false;
    this.feedback.advanceCount.textContent = `Siguiente en ${this._advanceCount}s`;
    this._advanceTimer = setInterval(() => {
      this._advanceCount--;
      if (this._advanceCount <= 0) {
        this._advanceNow();
      } else {
        this.feedback.advanceCount.textContent = `Siguiente en ${this._advanceCount}s`;
      }
    }, 1000);
  }

  _clearAdvance() {
    if (this._advanceTimer) clearInterval(this._advanceTimer);
    this._advanceTimer = null;
    this._advanceCount = 0;
    this._hide(this.feedback.advanceRow);
  }

  _advanceNow() {
    this._clearAdvance();
    if (!this.active) return;
    this._setInteractive(true);
    this.ivw.next.disabled = false;
    this.ivw.skip.disabled = false;
    this._renderQuestion();
  }

  // ---------- Fin e informes ----------
  _endInterview() {
    this.active = false;
    this.timer.stop();
    this.speech.stop();
    if (this.useSpeech) this.speech.speak('Entrevista terminada. Buen trabajo.');

    this._hide(this.ivw.box, this.feedback.box);
    this._show(this.result.box);

    const scored = this.respuestas.filter((item) => typeof item.score === 'number');
    const avg = scored.length
      ? scored.reduce((acc, item) => acc + item.score, 0) / scored.length
      : 0;

    this.result.score.textContent = scored.length ? `${avg.toFixed(1)} / 5` : '—';
    this.result.caption.textContent = scored.length
      ? `Resultado general: ${this._scoreLabel(avg)}. Revisa tus respuestas en el informe.`
      : 'No hubo respuestas evaluadas. Practica de nuevo para obtener tu puntuación.';

    this._renderStageResults();
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

  _openPreview() {
    this.preview.show();
    this.previewModal.backdrop.hidden = false;
  }

  _closePreview() {
    this.previewModal.backdrop.hidden = true;
  }

  _downloadPdf() {
    this.pdfGen.generateAndSave();
  }

  _resetInterview() {
    this.active = false;
    this._clearAdvance();
    this.timer.stop();
    this.speech.stop();
    this.respuestas = [];
    this.queue = [];
    this.index = 0;
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
          throw new Error(`HTTP ${resp.status}`);
        }
        return await resp.json();
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError || new Error('Backend no disponible');
  }

  // ---------- Utilidades ----------
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
    this.ivw.answer.disabled = !enabled;
    this.ivw.next.disabled = !enabled;
    this.ivw.skip.disabled = !enabled;
    this.ivw.voice.disabled = !enabled || !this.useVoice;
    this.ivw.answer.placeholder = enabled
      ? 'Escribe o dicta tu respuesta aquí…'
      : 'Inicia la entrevista para escribir.';
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