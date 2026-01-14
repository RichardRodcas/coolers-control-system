// authServer.js
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import Joi from 'joi';
import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pkg;

// ======================= Configuración de BD =======================
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'sistema_coolers_typsa',
  password: process.env.DB_PASS || 'Password1$BD',
  port: process.env.DB_PORT || 5432,
});

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// ======================= Rate limiting =======================
const authLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 30 });
app.use('/auth', authLimiter);

// ======================= JWT config =======================
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TTL = '10m';
const REFRESH_TTL = '7d';

const refreshTokens = new Set();

// ======================= Función para emitir tokens =======================
const issueTokens = (payload) => {
  const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TTL });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TTL });
  return { accessToken, refreshToken };
};

// ======================= Middleware exportable =======================
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
  role: Joi.string().valid('operador_ingreso','operador_salida','admin').default('operador_ingreso'),
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

  try {
    const exists = await pool.query('SELECT 1 FROM usuarios WHERE email=$1', [email]);
    if (exists.rowCount > 0) return res.status(409).json({ error: 'Usuario ya existe' });

    const passwordHash = await bcrypt.hash(password, 12);
    await pool.query(
      'INSERT INTO usuarios (name, email, password, role, creado_en, actualizado_en) VALUES ($1,$2,$3,$4,NOW(),NOW())',
      [name, email, passwordHash, role]
    );

    console.log(`[REGISTER] Usuario: ${email}, Nombre: ${name}, Rol: ${role}`);
    res.status(201).json({ message: 'Usuario creado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en registro' });
  }
});

// ======================= Login =======================
app.post('/auth/login', async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email=$1', [email]);
    if (result.rowCount === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    // Payload con sub = email
    const payload = { sub: email, role: user.role, name: user.name };
    const { accessToken, refreshToken } = issueTokens(payload);

    refreshTokens.add(refreshToken);
    res.cookie('rt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
      path: '/'
    });

    console.log(`[LOGIN] Usuario: ${email}, Nombre: ${user.name}`);
    res.json({ accessToken, role: user.role, name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en login' });
  }
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
const PORT = process.env.AUTH_PORT || 4000;
app.listen(PORT, () => console.log(`Auth server en puerto ${PORT}`));