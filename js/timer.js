// ---------- js/timer.js ----------
export class Timer {
  constructor(displayElem, duration, onTimeout) {
    this.displayElem = displayElem;
    this.duration = duration;
    this.onTimeout = onTimeout;
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
  }
}