const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : 'https://dashboard-mundial-nmcm.onrender.com/api';

// ─── Tabs ────────────────────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab + 'Form').classList.add('active');
    clearAlert();
  });
});

// ─── Validación frontend ─────────────────────────────────────────────────

function showFieldError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.previousElementSibling.classList.toggle('error', !!msg);
}

function validateEmailFormat(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showAlert(msg, type) {
  const el = document.getElementById('authAlert');
  el.textContent = msg;
  el.className = 'alert ' + type;
}

function clearAlert() {
  const el = document.getElementById('authAlert');
  el.className = 'alert';
  el.textContent = '';
}

// ─── Login ───────────────────────────────────────────────────────────────
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlert();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  let valid = true;
  showFieldError('loginEmailError', '');
  showFieldError('loginPasswordError', '');

  if (!validateEmailFormat(email)) {
    showFieldError('loginEmailError', 'Ingresa un email válido');
    valid = false;
  }
  if (!password) {
    showFieldError('loginPasswordError', 'Ingresa tu contraseña');
    valid = false;
  }
  if (!valid) return;

  const btn = document.getElementById('loginBtn');
  btn.disabled = true;
  btn.textContent = 'Ingresando...';

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      showAlert(data.error || 'Error al iniciar sesión', 'error');
      return;
    }

    // Guardar token y usuario en sessionStorage (se borra al cerrar el navegador)
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = 'dashboard.html';

  } catch {
    showAlert('No se pudo conectar con el servidor. ¿Está corriendo el backend?', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Entrar';
  }
});

// ─── Registro ────────────────────────────────────────────────────────────
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlert();

  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;

  let valid = true;
  showFieldError('regNameError', '');
  showFieldError('regEmailError', '');
  showFieldError('regPasswordError', '');

  if (name.length < 2) {
    showFieldError('regNameError', 'Nombre muy corto (mínimo 2 caracteres)');
    valid = false;
  }
  if (!validateEmailFormat(email)) {
    showFieldError('regEmailError', 'Ingresa un email válido');
    valid = false;
  }
  if (password.length < 6) {
    showFieldError('regPasswordError', 'Mínimo 6 caracteres');
    valid = false;
  }
  if (!valid) return;

  const btn = document.getElementById('registerBtn');
  btn.disabled = true;
  btn.textContent = 'Creando cuenta...';

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      showAlert(data.error || 'Error al registrarse', 'error');
      return;
    }

    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = 'dashboard.html';

  } catch {
    showAlert('No se pudo conectar con el servidor.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Crear cuenta';
  }
});

// Redirigir si ya hay sesión
if (sessionStorage.getItem('token')) {
  window.location.href = 'dashboard.html';
}
