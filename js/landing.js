// ---------- js/landing.js ----------
import { ROLES, APP_SETTINGS } from './config.js';
import { DataManager } from './dataManager.js';

function populateRoles() {
  const select = document.getElementById('campo');
  if (!select) return;

  ROLES.forEach((rol) => {
    const opt = document.createElement('option');
    opt.value = rol.id;
    opt.textContent = rol.label;
    select.appendChild(opt);
  });
}

function validate(form) {
  const nombre = form.querySelector('#nombre').value.trim();
  const apellidos = form.querySelector('#apellidos').value.trim();
  const correo = form.querySelector('#correo').value.trim();
  const campo = form.querySelector('#campo').value;

  if (!nombre || !apellidos || !campo) {
    return 'Completa nombre, apellidos y el área a la que aplicas.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return 'Ingresa un correo electrónico válido.';
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
    document.getElementById('correo').value = prev.correo || '';
    document.getElementById('telefono').value = prev.telefono || '';
    document.getElementById('experiencia').value = prev.experiencia || '';
    document.getElementById('campo').value = prev.rol || '';
  }

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
      correo: form.querySelector('#correo').value.trim(),
      telefono: form.querySelector('#telefono').value.trim(),
      experiencia: form.querySelector('#experiencia').value,
      rol: form.querySelector('#campo').value,
      fecha: new Date().toISOString()
    });

    window.location.href = 'simulador.html';
  });
}

// Reemplaza los inputs por el estado de la fecha actual en el footer.
document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());

document.addEventListener('DOMContentLoaded', init);