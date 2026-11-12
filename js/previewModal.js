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
    info.textContent = `Nombre: ${this.d.nombre || 'N/A'} ${this.d.apellidos || ''}`.trim();
    this.container.appendChild(info);

    if (!respuestas.length) {
      const empty = el('p', 'muted');
      empty.textContent = 'Aún no hay respuestas registradas.';
      this.container.appendChild(empty);
      return;
    }

    // Resumen numérico
    const scored = respuestas.filter((item) => typeof item.score === 'number');
    const avg = scored.length
      ? scored.reduce((acc, item) => acc + item.score, 0) / scored.length
      : null;

    const groups = new Map();
    scored.forEach((item) => {
      const key = item.etapa || 'General';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item.score);
    });
    const stageAvgs = [...groups.entries()].map(([name, scores]) => ({
      name,
      avg: scores.reduce((acc, score) => acc + score, 0) / scores.length
    }));
    const best = stageAvgs.reduce((a, b) => (b.avg > a.avg ? b : a), stageAvgs[0]);
    const worst = stageAvgs.reduce((a, b) => (b.avg < a.avg ? b : a), stageAvgs[0]);

    const stats = el('div', 'preview-stats');
    const addStat = (label, value) => {
      const item = el('div', 'preview-stat');
      const labelEl = el('span', 'label');
      labelEl.textContent = label;
      const valueEl = el('span', 'value');
      valueEl.textContent = value;
      item.append(labelEl, valueEl);
      stats.appendChild(item);
    };

    addStat('Promedio', avg !== null ? `${avg.toFixed(1)} / 5` : '—');
    addStat('Respuestas', String(respuestas.length));
    if (stageAvgs.length) {
      addStat('Mejor etapa', `${best.name} · ${best.avg.toFixed(1)}/5`);
    }
    if (stageAvgs.length > 1 && worst.avg < best.avg) {
      addStat('A reforzar', `${worst.name} · ${worst.avg.toFixed(1)}/5`);
    }
    this.container.appendChild(stats);

    const hr = el('hr');
    this.container.appendChild(hr);

    // Cada pregunta, colapsable para no saturar el informe
    const list = el('div', 'preview-list');

    respuestas.forEach((item, i) => {
      const details = el('details', 'preview-block');

      const summary = el('summary');
      const meta = el('span', 'preview-q-meta');
      meta.textContent = `Pregunta ${i + 1} · ${item.etapa || 'General'}`;
      const score = el('span', 'preview-score');
      const scoreNum = Number(item.score);
      score.textContent = `${item.score ?? '-'}/5`;
      if (Number.isFinite(scoreNum)) {
        score.classList.add(scoreNum >= 4 ? 'is-high' : scoreNum <= 2 ? 'is-low' : 'is-mid');
      }
      summary.append(meta, score);
      details.appendChild(summary);

      const body = el('div', 'preview-body');

      const q = el('p', 'q');
      q.textContent = item.pregunta;
      body.appendChild(q);

      const answerLabel = el('div', 'preview-label');
      answerLabel.textContent = 'Tu respuesta';
      body.appendChild(answerLabel);

      const a = el('p', 'a');
      a.textContent = item.respuesta;
      body.appendChild(a);

      if (item.feedback && typeof item.feedback === 'object') {
        const addList = (title, entries) => {
          if (!Array.isArray(entries) || !entries.length) return;
          const heading = el('h4');
          heading.textContent = title;
          body.appendChild(heading);

          const ul = el('ul');
          entries.forEach((text) => {
            const li = el('li');
            li.textContent = text;
            ul.appendChild(li);
          });
          body.appendChild(ul);
        };

        addList('Lo que hiciste bien', item.feedback.fortalezas);
        addList('Puedes mejorar', item.feedback.mejoras);

        if (item.feedback.tip) {
          const tip = el('p');
          const strongTip = el('strong');
          strongTip.textContent = 'Consejo: ';
          tip.append(strongTip, item.feedback.tip);
          body.appendChild(tip);
        }
      }

      details.appendChild(body);
      list.appendChild(details);
    });

    this.container.appendChild(list);
  }
}
