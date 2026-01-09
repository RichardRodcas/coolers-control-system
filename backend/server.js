// Importar librerías (ESM)
import express from 'express';
import cors from 'cors';
import { requireAuth } from './authServer.js'; // 👈 tu middleware de auth

const app = express();

// ======================= Middlewares =======================
app.use(cors({
  origin: 'http://localhost:3000', // ajusta según tu frontend
  credentials: true
}));
app.use(express.json());

// Logger simple
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`, 'body:', req.body);
  next();
});

// Utilidad de normalización
const norm = s => String(s ?? '').trim().toLowerCase();

// ======================= Datos simulados =======================
let coolers = [];
let usuarios = [
  { id: 1, name: 'Admin TYPSA', email: 'admin@typsa.com', role: 'admin' },
  { id: 2, name: 'Operador 1', email: 'op1@typsa.com', role: 'operador' }
];

// ======================= Funciones auxiliares =======================
const estadosValidos = ['operativo', 'observado', 'inoperativo'];

function validarEstado(estado) {
  const e = norm(estado);
  return estadosValidos.includes(e) ? e : null;
}
function buscarCooler(codigo) {
  return coolers.find(c => c.codigo === codigo);
}
function buscarUsuario(id) {
  return usuarios.find(u => u.id === Number(id));
}
function emailExistente(email, excludeId = null) {
  const e = norm(email);
  return usuarios.some(u => norm(u.email) === e && (excludeId ? u.id !== Number(excludeId) : true));
}

// ======================= ENDPOINTS COOLERS =======================
// ... (todos los endpoints de coolers que ya tenías: nuevo, ingreso, salida, mantenimiento, inventario, trazabilidad)
// Nuevo cooler
app.post('/coolers/nuevo', requireAuth(['admin']), (req, res) => {
  const { codigo, color, estado = 'operativo' } = req.body;
  if (!codigo) return res.status(400).json({ ok: false, mensaje: 'Código requerido' });
  if (buscarCooler(codigo)) return res.status(409).json({ ok: false, mensaje: 'Código ya registrado' });

  const estadoNorm = validarEstado(estado);
  if (!estadoNorm) return res.status(400).json({ ok: false, mensaje: `Estado inválido: ${estado}` });

  const cooler = {
    codigo,
    color: color ?? '',
    estado: estadoNorm,
    disponibilidad: 'laboratorio',
    cliente: '',
    ordenTrabajo: '',
    observacion: '',
    historial: []
  };

  cooler.historial.push({ tipo: 'nuevo', fecha: new Date(), estado: cooler.estado, color: cooler.color, disponibilidad: cooler.disponibilidad });
  coolers.push(cooler);
  res.json({ ok: true, mensaje: 'Cooler creado', data: cooler });
});

// Ingreso
app.post('/coolers/ingreso', requireAuth(['operador','admin']), (req, res) => {
  const { codigos = [] } = req.body;
  if (!Array.isArray(codigos) || codigos.length === 0) return res.status(400).json({ ok: false, mensaje: 'Debes enviar al menos un código en un array' });

  const errores = [];
  codigos.forEach(codigo => {
    const cooler = buscarCooler(codigo);
    if (!cooler) return errores.push({ codigo, mensaje: 'No encontrado' });
    if (['inoperativo','observado'].includes(norm(cooler.estado))) return errores.push({ codigo, mensaje: `Estado inválido: ${cooler.estado}` });
    if (norm(cooler.disponibilidad) === 'laboratorio') return errores.push({ codigo, mensaje: 'Ya está en laboratorio' });
  });

  if (errores.length) return res.status(400).json({ ok: false, mensaje: 'Errores en ingreso', errores });

  codigos.forEach(codigo => {
    const cooler = buscarCooler(codigo);
    cooler.disponibilidad = 'laboratorio';
    cooler.cliente = '';
    cooler.ordenTrabajo = '';
    cooler.historial.push({ tipo: 'ingreso', fecha: new Date(), estado: cooler.estado, disponibilidad: cooler.disponibilidad });
  });

  res.json({ ok: true, mensaje: `Ingreso registrado para ${codigos.length} cooler(s)`, codigos });
});

// Salida
app.post('/coolers/salida', requireAuth(['operador','admin']), (req, res) => {
  const { codigos = [], cliente, ordenTrabajo } = req.body;
  if (!cliente || !ordenTrabajo) return res.status(400).json({ ok: false, mensaje: 'Cliente y OT obligatorios' });
  if (!Array.isArray(codigos) || codigos.length === 0) return res.status(400).json({ ok: false, mensaje: 'Lista vacía' });

  const errores = [];
  codigos.forEach(codigo => {
    const cooler = buscarCooler(codigo);
    if (!cooler) return errores.push({ codigo, mensaje: 'No encontrado' });
    if (norm(cooler.estado) !== 'operativo') return errores.push({ codigo, mensaje: `Estado inválido: ${cooler.estado}` });
    if (norm(cooler.disponibilidad) !== 'laboratorio') return errores.push({ codigo, mensaje: `Disponibilidad inválida: ${cooler.disponibilidad}` });
  });

  if (errores.length) return res.status(400).json({ ok: false, mensaje: 'Errores en salida', errores });

  codigos.forEach(codigo => {
    const cooler = buscarCooler(codigo);
    cooler.disponibilidad = 'campo';
    cooler.cliente = cliente;
    cooler.ordenTrabajo = ordenTrabajo;
    cooler.historial.push({ tipo: 'salida', fecha: new Date(), cliente, ordenTrabajo, disponibilidad: cooler.disponibilidad });
  });

  res.json({ ok: true, mensaje: `Salida registrada para cliente ${cliente}, OT ${ordenTrabajo}`, codigos });
});

// Mantenimiento
app.put('/coolers/:codigo/mantenimiento', requireAuth(['admin']), (req, res) => {
  const { codigo } = req.params;
  const { estado, observacion = '' } = req.body;
  const cooler = buscarCooler(codigo);
  if (!cooler) return res.status(404).json({ ok: false, mensaje: 'No encontrado' });

  const estadoNorm = validarEstado(estado);
  if (!estadoNorm) return res.status(400).json({ ok: false, mensaje: `Estado inválido: ${estado}` });

  cooler.estado = estadoNorm;
  cooler.observacion = observacion;
  cooler.historial.push({ tipo: 'mantenimiento', fecha: new Date(), estado: cooler.estado, observacion, disponibilidad: cooler.disponibilidad });

  res.json({ ok: true, mensaje: 'Cooler actualizado', data: cooler });
});

app.delete('/coolers/:codigo/mantenimiento', requireAuth(['admin']), (req, res) => {
  const { codigo } = req.params;
  const index = coolers.findIndex(c => c.codigo === codigo);
  if (index === -1) return res.status(404).json({ ok: false, mensaje: 'No encontrado' });

  const eliminado = coolers.splice(index, 1)[0];
  res.json({ ok: true, mensaje: `Cooler ${codigo} eliminado`, data: eliminado });
});

// Inventario
app.get('/coolers', requireAuth(['operador','admin']), (req, res) => res.json({ ok: true, data: coolers }));
app.get('/coolers/fuera', requireAuth(['operador','admin']), (req, res) => res.json({ ok: true, data: coolers.filter(c => norm(c.disponibilidad) === 'campo') }));

// Trazabilidad
app.get('/coolers/:codigo', requireAuth(['operador','admin']), (req, res) => {
  const cooler = buscarCooler(req.params.codigo);
  if (!cooler) return res.status(404).json({ ok: false, mensaje: 'No encontrado' });
  res.json({ ok: true, data: cooler.historial });
});
app.get('/coolers/:codigo/detalle', requireAuth(['operador','admin']), (req, res) => {
  const cooler = buscarCooler(req.params.codigo);
  if (!cooler) return res.status(404).json({ ok: false, mensaje: 'No encontrado' });
  res.json({ ok: true, data: cooler });
});

// ======================= ENDPOINTS USUARIOS =======================

// Listar usuarios
app.get('/auth/usuarios', requireAuth(['admin']), (req, res) => {
  res.json({ ok: true, data: usuarios });
});

// Actualizar usuario
app.put('/auth/usuarios/:id', requireAuth(['admin']), (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;
  const usuario = buscarUsuario(id);
  if (!usuario) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });

  if (!name || !email || !role) {
    return res.status(400).json({ ok: false, mensaje: 'name, email y role son obligatorios' });
  }
  if (emailExistente(email, id)) {
    return res.status(409).json({ ok: false, mensaje: 'Correo ya registrado por otro usuario' });
  }
  const rolNorm = norm(role);
  if (!['admin', 'operador'].includes(rolNorm)) {
    return res.status(400).json({ ok: false, mensaje: `Rol inválido: ${role}` });
  }

  usuario.name = name;
  usuario.email = email;
  usuario.role = rolNorm;

  res.json({ ok: true, mensaje: 'Usuario actualizado', data: usuario });
});

// Eliminar usuario
app.delete('/auth/usuarios/:id', requireAuth(['admin']), (req, res) => {
  const { id } = req.params;
  const index = usuarios.findIndex(u => u.id === Number(id));
  if (index === -1) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });

  const eliminado = usuarios.splice(index, 1)[0];
  res.json({ ok: true, mensaje: `Usuario ${eliminado.email} eliminado`, data: eliminado });
});

// ======================= SERVIDOR =======================
const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor de negocio en http://localhost:${PORT}`));