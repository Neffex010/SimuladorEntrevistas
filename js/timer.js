// ---------- js/timer.js ----------
export class Timer {
  constructor(displayElem, duration, onTimeout, statusElem = null) {
    this.displayElem = displayElem;
    this.duration = duration;
    this.onTimeout = onTimeout;
    this.statusElem = statusElem;
    this._remaining = duration;
    this._intervalId = null;
  }

  get remaining() {
    return this._remaining;
  }

  start() {
    this.reset();
    this._intervalId = setInterval(() => {
      this._remaining--;
      this.updateDisplay();
      if (this._remaining <= 0) {
        this.stop();
        if (typeof this.onTimeout === 'function') this.onTimeout();
      }
    }, 1000);
  }

  reset() {
    this.stop();
    this._remaining = this.duration;
    if (this.statusElem) this.statusElem.textContent = '';
    this.updateDisplay();
  }

  stop() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  updateDisplay() {
    if (this.displayElem) {
      this.displayElem.textContent = `${this._remaining}s`;
      this.displayElem.classList.toggle('warn', this._remaining <= 15 && this._remaining > 5);
      this.displayElem.classList.toggle('danger', this._remaining <= 5);
    }
    this._announceRemaining();
  }

  // Anuncia solo los hitos importantes para no hablar cada segundo.
  _announceRemaining() {
    if (!this.statusElem) return;

    if (this._remaining === 15) {
      this.statusElem.textContent = 'Quedan 15 segundos.';
    } else if (this._remaining === 5) {
      this.statusElem.textContent = 'Quedan 5 segundos.';
    } else if (this._remaining === 0) {
      this.statusElem.textContent = 'Tiempo agotado.';
    }
  }
}
