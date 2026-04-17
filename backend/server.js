require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Base de usuarios en memoria (para proyecto universitario)
const users = [
  {
    id: 1,
    name: 'Admin',
    email: 'admin@demo.com',
    password: bcrypt.hashSync('admin123', 10)
  }
];

// ─── Validación de inputs ───────────────────────────────────────────────────

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return password && password.length >= 6;
}

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
}

// ─── Middleware de autenticación ────────────────────────────────────────────

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// ─── Rutas de autenticación ─────────────────────────────────────────────────

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const name = sanitize(req.body.name || '');
  const email = sanitize(req.body.email || '').toLowerCase();
  const password = req.body.password || '';

  if (!name || name.length < 2) {
    return res.status(400).json({ error: 'Nombre inválido (mínimo 2 caracteres)' });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }
  if (!validatePassword(password)) {
    return res.status(400).json({ error: 'Contraseña inválida (mínimo 6 caracteres)' });
  }
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'El email ya está registrado' });
  }

  const hashed = bcrypt.hashSync(password, 10);
  const newUser = { id: users.length + 1, name, email, password: hashed };
  users.push(newUser);

  const token = jwt.sign({ id: newUser.id, name: newUser.name, email }, JWT_SECRET, { expiresIn: '2h' });
  res.status(201).json({ message: 'Usuario registrado', token, user: { name, email } });
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const email = sanitize(req.body.email || '').toLowerCase();
  const password = req.body.password || '';

  if (!validateEmail(email) || !password) {
    return res.status(400).json({ error: 'Email o contraseña inválidos' });
  }

  const user = users.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ message: 'Login exitoso', token, user: { name: user.name, email: user.email } });
});

// GET /api/auth/me — verificar sesión activa
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/logout (el cliente descarta el token; el server confirma)
app.post('/api/auth/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Sesión cerrada correctamente' });
});

// ─── Ruta de salud ──────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log('Usuario de prueba: admin@demo.com / admin123');
});
