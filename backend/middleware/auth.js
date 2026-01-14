import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

export const requireAuth = (roles = []) => (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
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
  } catch (err) {
    console.error('[JWT VERIFY ERROR]', err.name, err.message);
    return res.status(401).json({ error: 'Token inválido/expirado' });
  }
};