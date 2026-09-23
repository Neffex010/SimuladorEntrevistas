// ---------- js/pdfReportGenerator.js ----------
import { ROLES } from './config.js';

export class PDFReportGenerator {
  constructor(respuestas, datosAspirante, config) {
    this.respuestas = respuestas;
    this.d = datosAspirante;
    this.config = config;
  }

  generateAndSave() {
    const { jsPDF } = window;
    if (!jsPDF) return;

    const doc = new jsPDF();
    const margin = 20;
    const pageW = doc.internal.pageSize.width;
    const [r, g, b] = this.config.colores.header;

    // Cabecera
    doc.setFillColor(r, g, b);
    doc.rect(0, 0, pageW, 34, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(this.config.fuentes.titulo);
    doc.setTextColor(255, 255, 255);
    doc.text('INFORME DE ENTREVISTA LABORAL', pageW / 2, 15, { align: 'center' });
    doc.setFontSize(this.config.fuentes.etiqueta);
    doc.setTextColor(210, 220, 230);
    doc.text(`Generado el ${new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageW / 2, 24, { align: 'center' });

    const rol = ROLES.find((item) => item.id === this.d.rol);
    const rolLabel = rol ? rol.label : 'Perfil TIC general';

    let y = 50;
    const width = pageW - 2 * margin;

    const addSection = (title, content) => {
      const ensure = () => {
        if (y > 255) { doc.addPage(); y = 30; }
      };
      ensure();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(this.config.fuentes.seccion);
      doc.setTextColor(...this.config.colores.acento);
      doc.text(title, margin, y);
      y += 3;
      doc.setDrawColor(...this.config.colores.acento);
      doc.setLineWidth(0.5);
      doc.line(margin, y, margin + 26, y);
      y += 9;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(this.config.fuentes.cuerpo);
      doc.setTextColor(...this.config.colores.texto);
      const lines = doc.splitTextToSize(content, width);
      lines.forEach((line) => {
        ensure();
        doc.text(line, margin, y);
        y += 6;
      });
      y += 8;
    };

    // Datos del candidato
    addSection('DATOS DEL CANDIDATO',
      `Nombre: ${this.d.nombre || 'N/A'} ${this.d.apellidos || ''}\n` +
      `Correo: ${this.d.correo || 'N/A'}\n` +
      `Teléfono: ${this.d.telefono || 'N/A'}\n` +
      `Área practicada: ${rolLabel || 'Perfil general'}\n` +
      `Experiencia: ${this.d.experiencia || 'No indicada'}`
    );

    // Resumen general
    const scored = this.respuestas.filter((item) => typeof item.score === 'number');
    const avg = scored.length
      ? (scored.reduce((acc, item) => acc + item.score, 0) / scored.length).toFixed(1)
      : 'N/D';
    addSection('RESUMEN GENERAL',
      `Preguntas respondidas: ${this.respuestas.length}\n` +
      `Puntuación promedio: ${avg} / 5`
    );

    // Detalle por pregunta
    this.respuestas.forEach((item, i) => {
      const feedbackLines =
        `Fortalezas:\n` +
        (item.feedback?.fortalezas || []).map((f) => `  • ${f}`).join('\n') +
        `\n\nOportunidades de mejora:\n` +
        (item.feedback?.mejoras || []).map((m) => `  • ${m}`).join('\n') +
        `\n\nConsejo:\n  ${item.feedback?.tip || ''}`;

      addSection(`PREGUNTA ${i + 1} — ${String(item.score ?? '-')}/5`,
        `Etapa: ${item.etapa || 'General'}\n` +
        `Pregunta: ${item.pregunta}\n\n` +
        `Tu respuesta:\n${item.respuesta}\n\n` +
        feedbackLines
      );
    });

    // Pie de página
    doc.setFillColor(...this.config.colores.header);
    doc.rect(0, 282, pageW, 15, 'F');
    doc.setFontSize(this.config.fuentes.etiqueta);
    doc.setTextColor(255, 255, 255);
    doc.text(`Documento generado con ${this.config.marca}`, margin, 289);
    doc.text('Práctica de entrevistas laborales', pageW - margin, 289, { align: 'right' });

    const nombreArchivo = `informe_${(this.d.nombre || 'candidato').trim().replace(/\s+/g, '_')}.pdf`;
    doc.save(nombreArchivo);
  }
}