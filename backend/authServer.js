import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import Joi from 'joi';
import dotenv from 'dotenv';
import { requireAuth } from './middleware/auth.js';
import { pool } from './db.js';   // 👈 Usamos el pool centralizado

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Definir __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Certificados
const options = {
  key: fs.readFileSync(path.join(__dirname, '192.168.0.95-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '192.168.0.95.pem'))
};

// .env
dotenv.config({ path: path.join(__dirname, '.env') });

console.log("ACCESS_SECRET:", process.env.JWT_ACCESS_SECRET);
console.log("REFRESH_SECRET:", process.env.JWT_REFRESH_SECRET);

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://192.168.0.95:3000', 'https://192.168.0.95:3000'],
  credentials: true
}));

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
/*export const requireAuth = (roles = []) => (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    console.warn("[AUTH] No se recibió Authorization header");
    return res.status(401).json({ error: 'Sin token' });
  }
  const token = auth.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    if (roles.length && !roles.includes(decoded.role)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    req.user = decoded;
    next();
  } catch (err){
    return res.status(401).json({ error: 'Token inválido/expirado' });
  }
};*/

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

    res.status(201).json({ message: 'Usuario creado' });
  } catch (err) {
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

    const payload = { sub: email, role: user.role, name: user.name };
    const { accessToken, refreshToken } = issueTokens(payload);

    refreshTokens.add(refreshToken);
    res.cookie('rt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken, role: user.role, name: user.name });
  } catch (err) {
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

// ======================= Cambio de contraseña =======================
app.put("/auth/update-password", requireAuth(), async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const email = req.user.sub; // 👈 sub es el email

    const result = await pool.query("SELECT password FROM usuarios WHERE email = $1", [email]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

    const currentHash = result.rows[0].password;
    const match = await bcrypt.compare(oldPassword, currentHash);
    if (!match) return res.status(400).json({ error: "Contraseña actual incorrecta" });

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE usuarios SET password = $1, actualizado_en = NOW() WHERE email = $2", [newHash, email]);

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error interno" });
  }
});

// ======================= Inicio del servidor =======================
const PORT = process.env.AUTH_PORT || 4000;

https.createServer(options, app).listen(PORT, () => {
  console.log(`Servidor en https://192.168.0.95:${PORT}`);
});