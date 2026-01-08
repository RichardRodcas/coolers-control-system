// Importar librerías
const express = require('express');
const cors = require('cors');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Logger simple para auditar requests
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`, 'body:', req.body);
  next();
});

// Utilidad de normalización
const norm = s => String(s ?? '').trim().toLowerCase();

// Simulación temporal de datos
let coolers = [];

// ======================= NUEVO COOLER =======================
app.post('/coolers/nuevo', (req, res) => {
  const { codigo, color, estado = 'operativo' } = req.body;

  if (!codigo) return res.status(400).json({ mensaje: 'Código requerido' });

  const existente = coolers.find(c => c.codigo === codigo);
  if (existente) return res.status(409).json({ mensaje: 'Código ya registrado' });

  const estadoNorm = norm(estado);
  if (!['operativo', 'observado', 'inoperativo'].includes(estadoNorm)) {
    return res.status(400).json({ mensaje: `Estado inválido: ${estado}` });
  }

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

  cooler.historial.push({
    tipo: 'nuevo',
    fecha: new Date(),
    estado: cooler.estado,
    color: cooler.color,
    disponibilidad: cooler.disponibilidad
  });

  coolers.push(cooler);
  res.json({ mensaje: 'Cooler creado', cooler });
});

// ======================= INGRESO =======================
app.post('/coolers/ingreso', (req, res) => {
  const { codigos, codigo } = req.body;
  const lista = Array.isArray(codigos) ? codigos : (codigo ? [codigo] : []);

  if (lista.length === 0) {
    return res.status(400).json({ mensaje: 'Debes enviar al menos un código en un array' });
  }

  const errores = [];

  lista.forEach(codigo => {
    const cooler = coolers.find(c => c.codigo === codigo);
    if (!cooler) {
      errores.push({ codigo, mensaje: `❌ Cooler ${codigo} no encontrado` });
      return;
    }

    const estadoActual = norm(cooler.estado);
    const disponibilidadActual = norm(cooler.disponibilidad);

    if (estadoActual === 'inoperativo' || estadoActual === 'observado') {
      errores.push({ codigo, mensaje: `❌ El cooler ${codigo} no puede ingresar porque está en estado "${cooler.estado}"` });
      return;
    }

    if (disponibilidadActual === 'laboratorio') {
      errores.push({ codigo, mensaje: `❌ El cooler ${codigo} ya está en laboratorio` });
      return;
    }
  });

  if (errores.length > 0) {
    return res.status(400).json({
      mensaje: 'No se pudo registrar el ingreso: hay coolers inválidos en la lista',
      errores
    });
  }

  lista.forEach(codigo => {
    const cooler = coolers.find(c => c.codigo === codigo);
    cooler.disponibilidad = 'laboratorio';
    cooler.cliente = '';
    cooler.ordenTrabajo = '';

    cooler.historial.push({
      tipo: 'ingreso',
      fecha: new Date(),
      estado: cooler.estado,
      disponibilidad: cooler.disponibilidad
    });
  });

  res.json({
    mensaje: `✅ Ingreso registrado para ${lista.length} cooler(s)`,
    codigos: lista
  });
});

// ======================= SALIDA MÚLTIPLE =======================
app.post('/coolers/salida', (req, res) => {
  const { codigos, cliente = '', ordenTrabajo = '' } = req.body;
  const codigo = req.body.codigo;
  const lista = Array.isArray(codigos) ? codigos : (codigo ? [codigo] : []);

  if (lista.length === 0) {
    return res.status(400).json({ mensaje: 'Debes enviar al menos un código en un array' });
  }

  if (!cliente || !ordenTrabajo) {
    return res.status(400).json({ mensaje: 'Cliente y orden de trabajo son obligatorios' });
  }

  const errores = [];

  lista.forEach(codigo => {
    const cooler = coolers.find(c => c.codigo === codigo);
    if (!cooler) {
      errores.push({ codigo, mensaje: `❌ Cooler ${codigo} no encontrado` });
      return;
    }

    const estadoActual = norm(cooler.estado);
    const disponibilidadActual = norm(cooler.disponibilidad);

    if (estadoActual !== 'operativo') {
      errores.push({ codigo, mensaje: `❌ El cooler ${codigo} está en estado "${cooler.estado}" y no puede salir` });
      return;
    }

    if (disponibilidadActual !== 'laboratorio') {
      errores.push({ codigo, mensaje: `❌ El cooler ${codigo} está en disponibilidad "${cooler.disponibilidad}" y no puede salir` });
      return;
    }
  });

  if (errores.length > 0) {
    return res.status(400).json({
      mensaje: 'No se pudo registrar la salida: hay coolers inválidos en la lista',
      errores
    });
  }

  lista.forEach(codigo => {
    const cooler = coolers.find(c => c.codigo === codigo);
    cooler.disponibilidad = 'campo';
    cooler.cliente = cliente;
    cooler.ordenTrabajo = ordenTrabajo;

    cooler.historial.push({
      tipo: 'salida',
      fecha: new Date(),
      cliente,
      ordenTrabajo,
      disponibilidad: cooler.disponibilidad
    });
  });

  res.json({
    mensaje: `✅ Salida registrada para cliente ${cliente}, OT ${ordenTrabajo}`,
    codigos: lista
  });
});

// ======================= MANTENIMIENTO =======================
app.put('/coolers/:codigo/mantenimiento', (req, res) => {
  const { codigo } = req.params;
  const { estado, observacion = '' } = req.body;

  const cooler = coolers.find(c => c.codigo === codigo);
  if (!cooler) return res.status(404).json({ mensaje: 'Cooler no encontrado' });

  const estadoNorm = norm(estado);
  if (!['operativo', 'observado', 'inoperativo'].includes(estadoNorm)) {
    return res.status(400).json({ mensaje: `Estado inválido: ${estado}` });
  }

  cooler.estado = estadoNorm;
  cooler.observacion = observacion;

  cooler.historial.push({
    tipo: 'mantenimiento-modificacion',
    estado: cooler.estado,
    observacion: cooler.observacion,
    fecha: new Date(),
    disponibilidad: cooler.disponibilidad
  });

  res.json({ mensaje: 'Estado/observación actualizados en mantenimiento', cooler });
});

app.delete('/coolers/:codigo/mantenimiento', (req, res) => {
  const { codigo } = req.params;
  const index = coolers.findIndex(c => c.codigo === codigo);

  if (index === -1) return res.status(404).json({ mensaje: 'Cooler no encontrado' });

  const eliminado = coolers.splice(index, 1)[0];
  res.json({ mensaje: `Cooler ${codigo} eliminado desde mantenimiento`, eliminado });
});

// ======================= INVENTARIO =======================
app.get('/coolers', (req, res) => res.json(coolers));
app.get('/coolers/fuera', (req, res) => res.json(coolers.filter(c => norm(c.disponibilidad) === 'campo')));

// ======================= TRAZABILIDAD =======================
// Solo historial
app.get('/coolers/:codigo', (req, res) => {
  const cooler = coolers.find(c => c.codigo === req.params.codigo);
  if (!cooler) return res.status(404).json({ mensaje: 'Cooler no encontrado' });
  res.json(cooler.historial);
});

// Detalle completo del cooler
app.get('/coolers/:codigo/detalle', (req, res) => {
  const cooler = coolers.find(c => c.codigo === req.params.codigo);
  if (!cooler) return res.status(404).json({ mensaje: 'Cooler no encontrado' });
  res.json(cooler);
});

// ======================= SERVIDOR =======================
const PORT = 4000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));