// ---------- js/speechController.js ----------
// Reconocimiento de voz: dictado de respuestas (Web Speech API).

export class SpeechController {
  constructor(btnVoice, lang = 'es-MX') {
    this.btnVoice = btnVoice;
    this.lang = lang;
    this.recognition = null;
    this.isRecording = false;
    this.onResult = null;
    this.hintEl = document.querySelector('.voice-hint');
    this._recordingHint = 'Habla ahora… tu respuesta se escribirá al final.';

    if (this.btnVoice) {
      this.btnVoice.addEventListener('click', () => this._handleVoiceClick());
    }
  }

  _handleVoiceClick() {
    if (this.isRecording) this.stopRecognition();
    else this.startRecognition(this.onResult);
  }

  // ---------- Reconocimiento (dictado) ----------
  get supported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  startRecognition(onResult) {
    if (!this.supported) {
      alert('Tu navegador no soporta dictado por voz. Usa Chrome o Edge para esta función.');
      return;
    }
    if (this.isRecording) return;

    this.onResult = onResult;
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new Recognition();
    this.recognition.lang = this.lang;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;
    this.recognition.continuous = false;

    this.recognition.onstart = () => this._setRecordingUI(true);
    this.recognition.onend = () => this._setRecordingUI(false);
    this.recognition.onerror = (e) => {
      this._setRecordingUI(false);
      if (e.error === 'no-speech') {
        this._notifyUser('No se detectó voz. Intenta acercarte al micrófono.');
      } else if (e.error !== 'aborted') {
        this._notifyUser(`Error de reconocimiento: ${e.error}`);
      }
    };
    this.recognition.onresult = (ev) => {
      const text = Array.from(ev.results)
        .map((r) => r[0].transcript)
        .join(' ')
        .trim();
      this.stopRecognition();
      if (text && this.onResult) this.onResult(text);
    };

    try {
      this.recognition.start();
      this.isRecording = true;
      this._setRecordingUI(true);
    } catch {
      this._setRecordingUI(false);
    }
  }

  stopRecognition() {
    this._setRecordingUI(false);
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Ignorar si ya estaba detenido.
      }
      this.recognition = null;
    }
    this.isRecording = false;
  }

  _notifyUser(msg) {
    if (this.hintEl) this.hintEl.textContent = msg;
  }

  _setRecordingUI(active) {
    if (!this.btnVoice) return;
    this.btnVoice.textContent = active ? 'Grabando…' : 'Hablar';
    this.btnVoice.classList.toggle('is-recording', active);
    if (this.hintEl) this.hintEl.textContent = active ? this._recordingHint : '';
  }
}
