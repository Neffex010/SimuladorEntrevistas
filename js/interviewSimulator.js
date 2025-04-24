// ---------- src/interviewSimulator.js ----------
import { DataManager } from './dataManager.js';
import { Timer } from './timer.js';
import { SpeechController } from './speechController.js';
import { PDFReportGenerator } from './pdfReportGenerator.js';
import { PreviewModal } from './previewModal.js';
import { QUESTIONS, PDF_CONFIG, APP_SETTINGS } from './config.js';

export default class InterviewSimulator {
  constructor() {
    this.dataMgr = new DataManager();
    this.datosAspirante = this.dataMgr.requireDataOrRedirect();
    this.respuestasUsuario = [];
    this.moduloActual = null;
    this.indice = -1;

    // DOM Elements
    this.cardBienvenida = document.getElementById("bienvenidaCard");
    this.nombreElem = document.getElementById("nombreUsuario");
    this.controlElem = document.getElementById("controlUsuario");
    this.preguntaElem = document.getElementById("pregunta");
    this.feedbackElem = document.getElementById("feedback");
    this.respuestaInput = document.getElementById("respuesta");
    this.moduleLabel = document.getElementById("moduloActual");
    this.btnReiniciar = document.getElementById("btnReiniciar");

    // Controllers
    this.timer = new Timer(
      document.getElementById("timer"),
      APP_SETTINGS.tiempoPregunta,
      () => this._collectAnswer()
    );
    this.speech = new SpeechController(
      document.getElementById("btnVoz"),
      document.getElementById("btnMute"),
      'es-MX'
    );

    // Preview & PDF
    this.preview = new PreviewModal(
      document.getElementById("vistaPreviaContenido"),
      this.respuestasUsuario,
      this.datosAspirante
    );
    this.pdfGen = new PDFReportGenerator(
      this.respuestasUsuario,
      this.datosAspirante,
      PDF_CONFIG,
      window.jspdf.jsPDF
    );

    // Listeners
    document.getElementById("btnComenzar").addEventListener("click", () => this.startInterview());
    document.getElementById("btnSiguiente").addEventListener("click", () => this._collectAnswer());
    document.getElementById("btnVoz").addEventListener("click", () =>
      this.speech.startRecognition(text => {
        if (text) this.respuestaInput.value = text;
        else this._showFeedback("No se detectó voz.");
      })
    );
    ["btnDescargarPDF", "descargarDesdeModal"].forEach(id => {
      document.getElementById(id).addEventListener("click", () => this.generatePDF());
    });
    document.getElementById("btnVistaPrevia").addEventListener("click", () => this.preview.show());
    this.btnReiniciar.addEventListener("click", () => this.reiniciarEntrevista());

    this.interactiveElements = {
      btnVoz: document.getElementById("btnVoz"),
      btnSiguiente: document.getElementById("btnSiguiente"),
      respuestaInput: document.getElementById("respuesta")
    };

    // Prevent focus before start
    this.interactiveElements.respuestaInput.addEventListener('focus', () => {
      if (!this.moduloActual) {
        this._showFeedback("Primero inicia la entrevista");
        this.interactiveElements.respuestaInput.blur();
      }
    });

    this._setInteractiveState(false);
  }

  startInterview() {
    this.moduloActual = 'tecnicas';
    this.indice = 0;
    this.respuestasUsuario.length = 0;

    // UI
    document.getElementById("inicioEntrevista").classList.add("d-none");
    this.cardBienvenida.classList.remove("d-none");
    this.nombreElem.textContent = `${this.datosAspirante.nombre} ${this.datosAspirante.apellidos}`;
    this.controlElem.textContent = this.datosAspirante.control;
    this.moduleLabel.classList.remove("d-none");
    this.moduleLabel.textContent = "Módulo: Habilidades Técnicas";

    this._showQuestion();
    this._setInteractiveState(true);
  }

  _startSoftModule() {
    this.moduloActual = 'blandas';
    this.indice = 0;
    this._showFeedback("✅ Fin módulo técnico. Ahora preguntas blandas.");
    setTimeout(() => {
      this._clearFeedback();
      this.moduleLabel.textContent = "Módulo: Habilidades Blandas";
      this._showQuestion();
    }, 3000);
  }

  _showQuestion() {
    const list = QUESTIONS[this.moduloActual];
    if (this.indice >= list.length) {
      return this.moduloActual === 'tecnicas'
        ? this._startSoftModule()
        : this._endInterview();
    }

    const txt = list[this.indice];
    this.preguntaElem.textContent = txt;
    this.preguntaElem.classList.add("fade-in");
    this.preguntaElem.addEventListener('animationend', () => {
      this.preguntaElem.classList.remove("fade-in");
    }, { once: true });

    this.respuestaInput.value = '';
    this._clearFeedback();
    this.timer.reset();
    this.timer.start();
    this.speech.speak(txt);

    const total = QUESTIONS.tecnicas.length + QUESTIONS.blandas.length;
    const currentIndex = this.moduloActual === 'tecnicas'
      ? this.indice + 1
      : QUESTIONS.tecnicas.length + this.indice + 1;
    const percent = Math.min(100, Math.round(currentIndex / total * 100));
    document.getElementById('progressBar').style.width = `${percent}%`;
  }

  async _collectAnswer() {
    if (!this.moduloActual) {
      return this._showFeedback("❌ Acción no permitida: Entrevista no iniciada");
    }

    this.timer.stop();
    const text = this.respuestaInput.value.trim();
    if (!text) return this._showFeedback('⚠️ No se detectó una respuesta.');

    try {
      const fb = await this._fetchFeedback(text);
      this.respuestasUsuario.push({
        modulo: this.moduloActual,
        pregunta: QUESTIONS[this.moduloActual][this.indice],
        respuesta: text,
        feedback: fb
      });

      // Mostrar feedback estructurado
      this.feedbackElem.innerHTML = `
        <div class="feedback-section">
          <h4>🔍 Fortalezas</h4>
          <ul>${fb.fortalezas.map(f => `<li>${f}</li>`).join('')}</ul>
          <h4>⚙️ Oportunidades</h4>
          <ul>${fb.mejoras.map(m => `<li>${m}</li>`).join('')}</ul>
          <h4>💡 Tip</h4>
          <p>${fb.tip}</p>
        </div>
      `;
      this.feedbackElem.classList.remove('d-none');

      this.indice++;
      setTimeout(() => this._showQuestion(), 4000);
    } catch (e) {
      console.error(e);
      this._showFeedback('❌ Error analizando la respuesta.');
    }
  }

  _showFeedback(msg) {
    this.feedbackElem.textContent = msg;
    this.feedbackElem.classList.remove('d-none');
  }

  _clearFeedback() {
    this.feedbackElem.classList.add('d-none');
  }

  async _fetchFeedback(text) {
    const systemMsg = `
      Eres un coach experto en entrevistas laborales en areas tecnicas y blandas. Cuando evalúes la respuesta, devuelve exactamente un JSON con esta forma:
      {
        "fortalezas": ["…","…"],
        "mejoras": ["…","…"],
        "tip": "…"
      }
    `;
    const payload = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemMsg },
        { role: 'user', content: `Evalúa esta respuesta: "${text}"` }
      ],
      temperature: 0.5
    };

    const resp = await fetch(APP_SETTINGS.openAIEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${APP_SETTINGS.openAIKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      throw new Error(`OpenAI API error: ${resp.status}`);
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '';

    try {
      return JSON.parse(content);
    } catch {
      console.warn('JSON parse failed:', content);
      return { fortalezas: [], mejoras: [], tip: 'No se generó feedback estructurado. Intenta de nuevo.' };
    }
  }

  _endInterview() {
    this.preguntaElem.textContent = "✅ Entrevista finalizada. ¡Buen trabajo!";
    this.btnReiniciar.classList.remove("d-none");
    document.getElementById("btnVistaPrevia").classList.remove("d-none");
    document.getElementById("btnDescargarPDF").classList.remove("d-none");
  }

  generatePDF() {
    this.pdfGen.generateAndSave();
  }

  reiniciarEntrevista() {
    this.indice = -1;
    this.moduloActual = null;
    this.respuestasUsuario = [];

    document.getElementById("progressBar").style.width = "0%";
    document.getElementById("timer").textContent = "--";
    this.preguntaElem.textContent = "Presiona comenzar para iniciar la entrevista";
    this.respuestaInput.value = "";
    this.feedbackElem.classList.add("d-none");

    this.btnReiniciar.classList.add("d-none");
    document.getElementById("btnVistaPrevia").classList.add("d-none");
    document.getElementById("btnDescargarPDF").classList.add("d-none");

    document.getElementById("inicioEntrevista").classList.remove("d-none");

    this.timer.stop();
    this.speech.stopRecognition();
    window.speechSynthesis.cancel();
    if (typeof this.speech.setInterviewState === 'function') {
      this.speech.setInterviewState(false);
    }
  }

  _setInteractiveState(active) {
    Object.values(this.interactiveElements).forEach(el => {
      el.disabled = !active;
      el.classList.toggle('disabled', !active);
    });
    this.interactiveElements.respuestaInput.placeholder = active
      ? "Escribe o di tu respuesta..."
      : "Presiona 'Comenzar' para habilitar";
  }
}
