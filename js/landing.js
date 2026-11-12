// ---------- js/landing.js ----------
import { getRole, groupRolesBySector } from './config.js';
import { DataManager } from './dataManager.js';

function populateRoles() {
  const select = document.getElementById('campo');
  if (!select) return;

  groupRolesBySector().forEach((roles, sector) => {
    const group = document.createElement('optgroup');
    group.label = sector;

    roles.forEach((rol) => {
      const opt = document.createElement('option');
      opt.value = rol.id;
      opt.textContent = rol.label;
      group.appendChild(opt);
    });

    select.appendChild(group);
  });
}

function updateRoleHint() {
  const select = document.getElementById('campo');
  const hint = document.getElementById('roleHint');
  if (!select || !hint) return;

  if (!select.value) {
    hint.textContent = '';
    return;
  }

  const rol = getRole(select.value);
  hint.textContent = `${rol.desc} · 6 o 12 preguntas por sesión.`;
}

function validate(form) {
  const nombre = form.querySelector('#nombre').value.trim();
  const apellidos = form.querySelector('#apellidos').value.trim();
  const campo = form.querySelector('#campo').value;

  if (!nombre || !apellidos || !campo) {
    return 'Completa nombre, apellidos y el área a la que aplicas.';
  }
  return '';
}

function init() {
  populateRoles();

  const form = document.getElementById('formDatos');
  const errorEl = document.getElementById('formError');
  const dataMgr = new DataManager();

  // Si ya hubo sesión previa, precargar los campos con lo guardado.
  const prev = dataMgr.load();
  if (prev) {
    document.getElementById('nombre').value = prev.nombre || '';
    document.getElementById('apellidos').value = prev.apellidos || '';
    document.getElementById('campo').value = prev.rol || '';
  }

  updateRoleHint();
  document.getElementById('campo').addEventListener('change', updateRoleHint);

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const msg = validate(form);
    if (msg) {
      errorEl.textContent = msg;
      errorEl.hidden = false;
      return;
    }
    errorEl.hidden = true;

    dataMgr.save({
      nombre: form.querySelector('#nombre').value.trim(),
      apellidos: form.querySelector('#apellidos').value.trim(),
      rol: form.querySelector('#campo').value,
      fecha: new Date().toISOString()
    });

    window.location.href = 'simulador.html';
  });
}

// Actualiza el año del footer.
document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());

document.addEventListener('DOMContentLoaded', init);
