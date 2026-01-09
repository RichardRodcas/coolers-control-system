// authServer.js
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import Joi from 'joi';

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// Rate limiting
const authLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 30 });
app.use('/auth', authLimiter);

// JWT config
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'clave-access';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'clave-refresh';
const ACCESS_TTL = '10m';
const REFRESH_TTL = '7d';

// Simulación de usuarios
const users = new Map(); // email -> { passwordHash, role, name }
const refreshTokens = new Set();

// Función para emitir tokens
const issueTokens = (payload) => {
  const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TTL });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TTL });
  return { accessToken, refreshToken };
};

// Middleware exportable
export const requireAuth = (roles = []) => (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Sin token' });
  const token = auth.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    if (roles.length && !roles.includes(decoded.role)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido/expirado' });
  }
};

// ======================= Validación con Joi =======================
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('operador','admin').default('operador'),
  name: Joi.string().min(2).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// ======================= Registro =======================
app.post('/auth/register', async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { email, password, role, name } = req.body;
  if (users.has(email)) return res.status(409).json({ error: 'Usuario ya existe' });

  const passwordHash = await bcrypt.hash(password, 12);
  users.set(email, { passwordHash, role, name });
  console.log(`[REGISTER] Usuario: ${email}, Nombre: ${name}, Rol: ${role}`);
  res.status(201).json({ message: 'Usuario creado' });
});

// ======================= Login =======================
app.post('/auth/login', async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { email, password } = req.body;
  const user = users.get(email);
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

  const payload = { sub: email, role: user.role, name: user.name };
  const { accessToken, refreshToken } = issueTokens(payload);

  refreshTokens.add(refreshToken);
  res.cookie('rt', refreshToken, {
    httpOnly: true,
    secure: false, // ⚠️ en desarrollo sin HTTPS debe ser false
    sameSite: 'Lax',
    path: '/'
  });

  console.log(`[LOGIN] Usuario: ${email}, Nombre: ${user.name}`);
  res.json({ accessToken, role: user.role, name: user.name });
});

// ======================= Refresh =======================
app.post('/auth/refresh', (req, res) => {
  const rt = req.cookies?.rt;
  if (!rt || !refreshTokens.has(rt)) return res.status(401).json({ error: 'Refresh inválido' });

  try {
    const decoded = jwt.verify(rt, JWT_REFRESH_SECRET);
    const payload = { sub: decoded.sub, role: decoded.role, name: decoded.name };
    const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TTL });
    res.json({ accessToken, role: decoded.role, name: decoded.name });
  } catch {
    return res.status(401).json({ error: 'Refresh expirado o inválido' });
  }
});

// ======================= Logout =======================
app.post('/auth/logout', (req, res) => {
  const rt = req.cookies?.rt;
  if (rt) refreshTokens.delete(rt);
  res.clearCookie('rt', { path: '/' });
  res.json({ message: 'Sesión cerrada' });
});

// ======================= Inicio del servidor =======================
app.listen(4000, () => console.log('Auth server en puerto 4000'));