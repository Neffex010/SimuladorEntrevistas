// ---------- js/previewModal.js ----------
export class PreviewModal {
  constructor(containerElem, getRespuestas, datosAspirante) {
    this.container = containerElem;
    this.getRespuestas = getRespuestas;
    this.d = datosAspirante;
  }

  show() {
    const respuestas = this.getRespuestas();
    if (!this.container) return;

    this.container.innerHTML = '';
    const el = (tag, cls) => {
      const node = document.createElement(tag);
      if (cls) node.className = cls;
      return node;
    };

    // Datos del aspirante
    this.container.appendChild(el('h3', 'preview-title')).textContent = 'Datos del aspirante';
    const info = el('p', 'muted');
    info.append(
      `Nombre: ${this.d.nombre || 'N/A'} ${this.d.apellidos || ''} · `,
      `Correo: ${this.d.correo || 'N/A'}`
    );
    this.container.appendChild(info);

    const hr = el('hr');
    this.container.appendChild(hr);

    if (!respuestas.length) {
      const empty = el('p', 'muted');
      empty.textContent = 'Aún no hay respuestas registradas.';
      this.container.appendChild(empty);
      return;
    }

    // Resumen numérico
    const scored = respuestas.filter((item) => typeof item.score === 'number');
    const avg = scored.length
      ? (scored.reduce((acc, item) => acc + item.score, 0) / scored.length).toFixed(1)
      : '—';
    const summaryLabel = el('div', 'preview-summary');
    const strongAvg = el('strong');
    strongAvg.textContent = `Promedio: ${avg} / 5`;
    const strongCount = el('strong');
    strongCount.textContent = `Respuestas: ${respuestas.length}`;
    summaryLabel.append(strongAvg, '   ', strongCount);
    this.container.appendChild(summaryLabel);

    // Cada pregunta
    respuestas.forEach((item, i) => {
      const block = el('div', 'preview-block');

      const head = el('h4');
      head.textContent = `Pregunta ${i + 1} · ${item.etapa || 'General'} · ${item.score ?? '-'}/5`;
      block.appendChild(head);

      const q = el('p', 'q');
      q.textContent = item.pregunta;
      block.appendChild(q);

      const aLabel = el('div');
      const strongAns = el('strong');
      strongAns.textContent = 'Tu respuesta:';
      aLabel.appendChild(strongAns);
      block.appendChild(aLabel);
      const a = el('p', 'a');
      a.textContent = item.respuesta;
      block.appendChild(a);

      if (item.feedback && typeof item.feedback === 'object') {
        const u1 = el('ul');
        (item.feedback.fortalezas || []).forEach((f) => {
          const li = el('li');
          li.textContent = f;
          u1.appendChild(li);
        });
        const u2 = el('ul');
        (item.feedback.mejoras || []).forEach((m) => {
          const li = el('li');
          li.textContent = m;
          u2.appendChild(li);
        });
        if (item.feedback.tip) {
          const tip = el('p');
          const strongTip = el('strong');
          strongTip.textContent = 'Consejo: ';
          tip.append(strongTip, item.feedback.tip);
          block.append(u1, u2, tip);
        } else {
          block.append(u1, u2);
        }
      }

      this.container.appendChild(block);
    });
  }
}