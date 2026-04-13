import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { pool } from './db.js';        // 👈 Usamos el pool centralizado
import { requireAuth } from './middleware/auth.js';

// Definir __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Certificados
const options = {
  key: fs.readFileSync(path.join(__dirname, '192.168.0.95-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '192.168.0.95.pem'))
};

// .env
dotenv.config({ path: new URL('./.env', import.meta.url) });

const app = express();
app.use(express.json());
app.use(cors({
  origin: ['http://192.168.0.95:3000', 'https://192.168.0.95:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']
}));

// Logger simple
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`, 'body:', req.body);
  next();
});

// ======================= Endpoints =======================

// Ejemplo: obtener todos los coolers
/*app.get('/coolers', requireAuth(), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM coolers ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error("[ERROR] /coolers:", err);
    res.status(500).json({ error: 'Error interno' });
  }
});*/

// Ejemplo: ingreso de cooler
app.post('/coolers/ingreso', requireAuth(['operador_ingreso','admin']), async (req, res) => {
  try {
    const { codigo, descripcion } = req.body;
    await pool.query(
      'INSERT INTO coolers (codigo, descripcion, estado, creado_en) VALUES ($1,$2,$3,NOW())',
      [codigo, descripcion, 'ingresado']
    );
    res.json({ message: 'Cooler ingresado correctamente' });
  } catch (err) {
    console.error("[ERROR] /coolers/ingreso:", err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Utilidad de normalización
const norm = s => String(s ?? '').trim().toLowerCase();


// ======================= Funciones auxiliares con BD =======================


const estadosValidos = ['operativo', 'observado', 'inoperativo'];

function validarEstado(estado) {
  const e = estado?.toLowerCase().trim();
  return estadosValidos.includes(e) ? e : null;
}

async function buscarCooler(codigo) {
  const result = await pool.query('SELECT * FROM coolers WHERE codigo=$1', [codigo]);
  return result.rows[0] || null;
}

async function buscarUsuario(email) {
  const result = await pool.query('SELECT * FROM usuarios WHERE email=$1', [email]);
  return result.rows[0] || null;
}

async function emailExistente(email, excludeEmail = null) {
  const result = excludeEmail
    ? await pool.query('SELECT 1 FROM usuarios WHERE email=$1 AND email<>$2', [email, excludeEmail])
    : await pool.query('SELECT 1 FROM usuarios WHERE email=$1', [email]);
  return result.rowCount > 0;
}

// ======================= ENDPOINTS COOLERS =======================
// Nuevo cooler
app.post('/coolers/nuevo', requireAuth(['admin']), async (req, res) => {
  const { codigo, color = '', estado = 'Operativo', disponibilidad = 'Laboratorio' } = req.body;
  if (!codigo) return res.status(400).json({ ok: false, mensaje: 'Código requerido' });

  try {
    const exists = await pool.query('SELECT 1 FROM coolers WHERE codigo=$1', [codigo.trim()]);
    if (exists.rowCount > 0) {
      return res.status(409).json({ ok: false, mensaje: 'Código ya registrado' });
    }

    const estadoValido = validarEstado(estado); // Debe devolver 'Operativo', 'Inoperativo', etc., con capitalización coherente
    if (!estadoValido) {
      return res.status(400).json({ ok: false, mensaje: 'Estado inválido' });
    }

    const result = await pool.query(
      `INSERT INTO coolers (codigo, color, estado, disponibilidad)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [codigo.trim(), color, estadoValido, disponibilidad]
    );

    res.json({ ok: true, mensaje: 'Cooler creado', cooler: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error creando cooler' });
  }
});

// Ingreso de coolers
app.post('/coolers/ingreso', requireAuth(['operador_ingreso','admin']), async (req, res) => {
  const { codigos = [] } = req.body;
  if (!Array.isArray(codigos) || codigos.length === 0) {
    return res.status(400).json({ ok: false, mensaje: 'Debes enviar al menos un código' });
  }

  const client = await pool.connect();
  const errores = [];

  try {
    await client.query('BEGIN');

    for (const rawCodigo of codigos) {
      const codigo = String(rawCodigo || '').trim();

      // Actualizar estado actual del cooler
      const updateResult = await client.query(
        `UPDATE coolers
           SET disponibilidad='Laboratorio',
               cliente_ruc=NULL,
               actualizado_en=NOW()
         WHERE codigo=$1
           AND LOWER(TRIM(estado))='operativo'
           AND LOWER(TRIM(disponibilidad))='campo'
         RETURNING codigo`,
        [codigo]
      );

      if (updateResult.rowCount === 0) {
        const prev = await client.query(
          `SELECT estado, disponibilidad FROM coolers WHERE codigo=$1`,
          [codigo]
        );
        if (prev.rowCount === 0) {
          errores.push({ codigo, mensaje: 'Cooler no existe' });
        } else {
          const { estado, disponibilidad } = prev.rows[0];
          errores.push({
            codigo,
            mensaje: `No puede ingresar: estado=${estado}, disponibilidad=${disponibilidad}. Debe estar Operativo y en Campo`
          });
        }
        continue;
      }

      // Buscar la última OT de salida para este cooler
      const prevSalida = await client.query(
        `SELECT orden_trabajo
         FROM movimientos_cooler
         WHERE cooler_codigo=$1 AND tipo='Salida'
         ORDER BY fecha DESC
         LIMIT 1`,
        [codigo]
      );

      const ot = prevSalida.rowCount ? prevSalida.rows[0].orden_trabajo : null;

      // Insertar movimiento de ingreso vinculado a la OT encontrada
      await client.query(
        `INSERT INTO movimientos_cooler (
           cooler_codigo, tipo, realizado_por,
           estado_resultante, disponibilidad_resultante,
           estado_evento, disponibilidad_evento,
           observacion, orden_trabajo
         ) VALUES ($1,'Ingreso',$2,'Operativo','Laboratorio',
                   'Operativo','Laboratorio','Ingreso registrado',$3)`,
        [codigo, req.user.sub, ot]
      );
    }

    await client.query('COMMIT');
    const ok = errores.length === 0;
    const mensaje = ok
      ? `Ingreso registrado para ${codigos.length} cooler(s)`
      : `Ingreso parcial: ${codigos.length - errores.length} ok, ${errores.length} con observaciones`;
    res.json({ ok, mensaje, errores });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error registrando ingreso' });

  } finally {
    client.release();
  }
}); 

// Salida de coolers
app.post('/coolers/salida', requireAuth(['operador_salida','admin']), async (req, res) => {
  const { codigos = [], clienteRuc, ordenTrabajo } = req.body; // 👈 RUC directo
  if (!Array.isArray(codigos) || codigos.length === 0) {
    return res.status(400).json({ ok: false, mensaje: 'Debes enviar al menos un código' });
  }
  if (!clienteRuc || !ordenTrabajo) {
    return res.status(400).json({ ok: false, mensaje: 'RUC y OT obligatorios' });
  }

  const client = await pool.connect();
  const errores = [];

  try {
    await client.query('BEGIN');

    for (const rawCodigo of codigos) {
      const codigo = String(rawCodigo || '').trim();

      const updateResult = await client.query(
        `UPDATE coolers
           SET disponibilidad='Campo',
               cliente_ruc=$2,
               actualizado_en=NOW()
         WHERE codigo=$1
           AND LOWER(TRIM(estado))='operativo'
           AND LOWER(TRIM(disponibilidad))='laboratorio'
         RETURNING codigo`,
        [codigo, clienteRuc]
      );

      if (updateResult.rowCount === 0) {
        const prev = await client.query(
          `SELECT estado, disponibilidad FROM coolers WHERE codigo=$1`,
          [codigo]
        );
        if (prev.rowCount === 0) {
          errores.push({ codigo, mensaje: 'Cooler no existe' });
        } else {
          const { estado, disponibilidad } = prev.rows[0];
          errores.push({
            codigo,
            mensaje: `No puede salir: estado=${estado}, disponibilidad=${disponibilidad}. Debe estar Operativo y en Laboratorio`
          });
        }
        continue;
      }

      await client.query(
        `INSERT INTO movimientos_cooler (
           cooler_codigo, tipo, hacia_cliente_ruc, realizado_por,
           estado_resultante, disponibilidad_resultante,
           estado_evento, disponibilidad_evento,
           observacion, orden_trabajo
         ) VALUES ($1,'Salida',$2,$3,'Operativo','Campo',
                   'Operativo','Campo','Salida registrada',$4)`,
        [codigo, clienteRuc, req.user.sub, ordenTrabajo]
      );
    }

    await client.query('COMMIT');
    const ok = errores.length === 0;
    const mensaje = ok
      ? `Salida registrada para ${codigos.length} cooler(s)`
      : `Salida parcial: ${codigos.length - errores.length} ok, ${errores.length} con observaciones`;
    res.json({ ok, mensaje, errores });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error registrando salida' });

  } finally {
    client.release();
  }
}); // 👈 cierre correcto del app.post

//actualizar mantenimiento de cooler
app.put('/coolers/:codigo/mantenimiento', requireAuth(['admin', 'operador_salida']), async (req, res) => {
  const codigo = String(req.params.codigo || '').trim().toUpperCase(); // 👈 normaliza
  const { estado, observacion = '', tipo = 'Correctivo', descripcion = 'Actualización de estado' } = req.body;

  try {
    const result = await pool.query('SELECT * FROM coolers WHERE UPPER(TRIM(codigo))=$1', [codigo]);
    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, mensaje: `Cooler ${codigo} no encontrado` });
    }

    const estadoValido = validarEstado(estado);
    if (!estadoValido) {
      return res.status(400).json({ ok: false, mensaje: `Estado inválido: ${estado}` });
    }

    const nuevaObservacion = estadoValido.toLowerCase() === 'operativo' ? '': observacion;

    await pool.query(
      `UPDATE coolers
         SET estado=$1, observacion=$2, actualizado_en=NOW()
       WHERE UPPER(TRIM(codigo))=$3`,
      [estadoValido, nuevaObservacion, codigo]
    );

    await pool.query(
      `INSERT INTO mantenimiento_cooler (
         cooler_codigo, tipo, descripcion, realizado_por,
         estado_resultante, observacion
       ) VALUES ($1,$2,$3,$4,$5,$6)`,
      [codigo, tipo, descripcion, req.user.sub, estadoValido, nuevaObservacion]
    );

    res.json({ ok: true, mensaje: `Cooler ${codigo} actualizado y mantenimiento registrado` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error en mantenimiento' });
  }
});

// Eliminar mantenimiento de cooler
app.delete('/coolers/:codigo', requireAuth(['admin']), async (req, res) => {
  const codigo = String(req.params.codigo || '').trim().toUpperCase();

  try {
    const result = await pool.query(
      'DELETE FROM coolers WHERE UPPER(TRIM(codigo))=$1 RETURNING *',
      [codigo]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, mensaje: `Cooler ${codigo} no encontrado` });
    }

    res.json({ ok: true, mensaje: `Cooler ${codigo} eliminado`, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error eliminando cooler' });
  }
});

// Inventario completo
app.get('/coolers', requireAuth(['admin','operador_ingreso','operador_salida']), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vw_inventario_coolers');
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error cargando inventario' });
  }
});


// Coolers en campo
app.get('/coolers/fuera', requireAuth(['admin','operador_ingreso','operador_salida']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM coolers WHERE LOWER(TRIM(disponibilidad))='campo'`
    );
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error cargando coolers en campo' });
  }
});

// Trazabilidad (movimientos + mantenimientos)
app.get(
  '/coolers/:codigo/trazabilidad',
  requireAuth(['admin', 'operador_ingreso', 'operador_salida']),
  async (req, res) => {
    try {
      const codigoNorm = String(req.params.codigo || '').trim().toUpperCase();

      // Historial: movimientos + mantenimientos
      const result = await pool.query(
        `SELECT * FROM (
           -- Movimientos (incluye cliente, disponibilidad y OT)
           SELECT m.fecha,
                  'Movimiento' AS tipo,
                  cl.razon_social AS cliente,
                  m.realizado_por,
                  m.estado_resultante AS estado,
                  m.disponibilidad_resultante AS disponibilidad,
                  m.observacion,
                  m.orden_trabajo AS "ordenTrabajo"
           FROM movimientos_cooler m
           LEFT JOIN clientes cl ON m.hacia_cliente_ruc = cl.ruc
           WHERE m.cooler_codigo=$1

           UNION ALL

           -- Mantenimientos (incluye OT si existe)
           SELECT mt.fecha,
                  'Mantenimiento' AS tipo,
                  NULL AS cliente,
                  mt.realizado_por,
                  mt.estado_resultante AS estado,
                  NULL AS disponibilidad,
                  mt.observacion,
                  mt.orden_trabajo AS "ordenTrabajo"
           FROM mantenimiento_cooler mt
           WHERE mt.cooler_codigo=$1
        ) AS historial
        ORDER BY fecha DESC`,
        [codigoNorm]
      );

      // Detalle actual del cooler
      const detalle = await pool.query(
        'SELECT * FROM coolers WHERE UPPER(TRIM(codigo))=$1',
        [codigoNorm]
      );

      if (detalle.rowCount === 0 && result.rowCount === 0) {
        return res.status(404).json({ ok: false, mensaje: 'Cooler no encontrado' });
      }

      res.json({
        ok: true,
        data: {
          detalle: detalle.rows[0] || null,
          historial: result.rows
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, mensaje: 'Error cargando trazabilidad' });
    }
  }
);

// Validación de códigos
app.post('/api/validate-code', requireAuth(['admin','operador_ingreso','operador_salida']), async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ ok: false, mensaje: 'Código requerido' });

  try {
    const result = await pool.query(
      `SELECT codigo, estado, disponibilidad
       FROM coolers
       WHERE codigo=$1`,
      [String(code || '').trim()]
    );
    res.json({ exists: result.rowCount > 0, data: result.rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error validando código' });
  }
});

// Detalle del cooler
app.get('/coolers/:codigo/detalle', requireAuth(['admin','operador_ingreso','operador_salida']), async (req, res) => {
  try {
    const { codigo } = req.params;
    const result = await pool.query(
      `SELECT c.*,
         -- Último movimiento
         (SELECT m.fecha
          FROM movimientos_cooler m
          WHERE m.cooler_codigo = c.codigo
          ORDER BY m.fecha DESC
          LIMIT 1) AS ultimo_movimiento,

         -- Cliente del último movimiento
         (SELECT cl.razon_social
          FROM movimientos_cooler m
          LEFT JOIN clientes cl ON m.hacia_cliente_ruc = cl.ruc
          WHERE m.cooler_codigo = c.codigo
          ORDER BY m.fecha DESC
          LIMIT 1) AS cliente,

         -- Última OT registrada (movimiento o mantenimiento)
         COALESCE(
           (SELECT m.orden_trabajo
            FROM movimientos_cooler m
            WHERE m.cooler_codigo = c.codigo
            ORDER BY m.fecha DESC
            LIMIT 1),
           (SELECT mt.orden_trabajo
            FROM mantenimiento_cooler mt
            WHERE mt.cooler_codigo = c.codigo
            ORDER BY mt.fecha DESC
            LIMIT 1)
         ) AS ultima_ot,

         -- Último mantenimiento
         (SELECT mt.fecha
          FROM mantenimiento_cooler mt
          WHERE mt.cooler_codigo = c.codigo
          ORDER BY mt.fecha DESC
          LIMIT 1) AS ultimo_mantenimiento

       FROM coolers c
       WHERE c.codigo = $1`,
      [String(codigo || '').trim()]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, mensaje: 'No encontrado' });
    }

    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error cargando detalle' });
  }
});


// ======================= ENDPOINTS USUARIOS =======================

// Listar usuarios
app.get('/auth/usuarios', requireAuth(['admin']), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT email, name, role, creado_en, actualizado_en FROM usuarios ORDER BY creado_en DESC'
    );
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error listando usuarios' });
  }
});

// Actualizar usuario
app.put('/auth/usuarios/:email', requireAuth(['admin']), async (req, res) => {
  const { email } = req.params;
  const { name, newEmail, role } = req.body;

  if (!name || !newEmail || !role) {
    return res.status(400).json({ ok: false, mensaje: 'name, newEmail y role son obligatorios' });
  }

  if (!['admin','operador_ingreso','operador_salida'].includes(role)) {
    return res.status(400).json({ ok: false, mensaje: `Rol inválido: ${role}` });
  }

  try {
    // Validar que el nuevo email no esté ocupado por otro usuario
    const exists = await pool.query(
      'SELECT 1 FROM usuarios WHERE email=$1 AND email<>$2',
      [newEmail, email]
    );
    if (exists.rowCount > 0) {
      return res.status(409).json({ ok: false, mensaje: 'Email ya registrado por otro usuario' });
    }

    const result = await pool.query(
      'UPDATE usuarios SET name=$1, email=$2, role=$3, actualizado_en=NOW() WHERE email=$4 RETURNING *',
      [name, newEmail, role, email]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    }

    res.json({ ok: true, mensaje: 'Usuario actualizado', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error actualizando usuario' });
  }
});

// Eliminar usuario
app.delete('/auth/usuarios/:email', requireAuth(['admin']), async (req, res) => {
  const { email } = req.params;

  try {
    const result = await pool.query('DELETE FROM usuarios WHERE email=$1 RETURNING *', [email]);
    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    }

    res.json({
      ok: true,
      mensaje: `Usuario ${result.rows[0].email} eliminado`,
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error eliminando usuario' });
  }
});

// ======================= ENDPOINTS CLIENTES =======================

// Listar clientes
app.get('/clientes', requireAuth(['admin','operador_salida']), async (req, res) => {
  try {
    const result = await pool.query('SELECT ruc, razon_social, email, telefono, direccion, creado_en, actualizado_en FROM clientes');
    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error listando clientes' });
  }
});

// Crear cliente
app.post('/clientes', requireAuth(['admin', 'operador_salida']), async (req, res) => {
  console.log("Body recibido en POST /clientes:", req.body);

  // ✅ Primero desestructuramos el body
  const { ruc, razon_social, email, telefono, direccion } = req.body;

  // Validación de campos obligatorios
  if (!ruc?.trim() || !razon_social?.trim() || !email?.trim()) {
    return res.status(400).json({ ok: false, mensaje: 'RUC, razón social y email son obligatorios' });
  }

  try {
    // Verificar si ya existe cliente con mismo RUC o email
    const exists = await pool.query(
      'SELECT 1 FROM clientes WHERE ruc=$1 OR email=$2',
      [ruc, email]
    );
    if (exists.rowCount > 0) {
      return res.status(409).json({ ok: false, mensaje: 'Cliente ya registrado' });
    }

    // Insertar nuevo cliente
    const result = await pool.query(
      'INSERT INTO clientes (ruc, razon_social, email, telefono, direccion) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [ruc, razon_social, email, telefono, direccion]
    );

    // Respuesta exitosa
    res.json({ ok: true, mensaje: 'Cliente registrado', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error creando cliente' });
  }
});

// Actualizar cliente
app.put('/clientes/:ruc', requireAuth(['admin', 'operador_salida']), async (req, res) => {
  const { ruc } = req.params;
  const { razon_social, email, telefono, direccion } = req.body;

  if (!razon_social || !email) {
    return res.status(400).json({ ok: false, mensaje: 'Razón social y email son obligatorios' });
  }

  try {
    const exists = await pool.query('SELECT 1 FROM clientes WHERE email=$1 AND ruc<>$2', [email, ruc]);
    if (exists.rowCount > 0) return res.status(409).json({ ok: false, mensaje: 'Correo ya registrado por otro cliente' });

    const result = await pool.query(
      'UPDATE clientes SET razon_social=$1, email=$2, telefono=$3, direccion=$4, actualizado_en=NOW() WHERE ruc=$5 RETURNING *',
      [razon_social, email, telefono, direccion, ruc]
    );

    if (result.rowCount === 0) return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });
    res.json({ ok: true, mensaje: 'Cliente actualizado', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error actualizando cliente' });
  }
});

// Eliminar cliente
app.delete('/clientes/:ruc', requireAuth(['admin', 'operador_salida']), async (req, res) => {
  const { ruc } = req.params;

  try {
    const result = await pool.query('DELETE FROM clientes WHERE ruc=$1 RETURNING *', [ruc]);
    if (result.rowCount === 0) return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' });

    res.json({ ok: true, mensaje: `Cliente ${result.rows[0].razon_social} eliminado`, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error eliminando cliente' });
  }
});


// Buscar coolers en campo por Orden de Trabajo (solo admin)
app.get('/coolers/por-ot/:ordenTrabajo', requireAuth(['admin', 'operador_salida']), async (req, res) => {
  try {
    const { ordenTrabajo } = req.params;

    const result = await pool.query(
      `SELECT DISTINCT ON (codigo)
              codigo,
              color,
              estado_resultante AS estado,
              disponibilidad_resultante AS disponibilidad,
              cliente,
              orden_trabajo,
              tipo_evento,
              fecha
       FROM (
         -- Movimientos asociados a la OT
         SELECT mc.cooler_codigo AS codigo,
                c.color,
                mc.estado_resultante,
                mc.disponibilidad_resultante,
                cl.razon_social AS cliente,
                mc.orden_trabajo,
                mc.tipo AS tipo_evento,
                mc.fecha
         FROM movimientos_cooler mc
         INNER JOIN coolers c ON mc.cooler_codigo = c.codigo
         LEFT JOIN clientes cl ON mc.hacia_cliente_ruc = cl.ruc
         WHERE mc.orden_trabajo = $1

         UNION ALL

         -- Mantenimientos asociados a la OT
         SELECT mt.cooler_codigo AS codigo,
                c.color,
                'Operativo' AS estado_resultante,   -- ajusta según tu lógica de mantenimiento
                'Laboratorio' AS disponibilidad_resultante,
                NULL AS cliente,
                mt.orden_trabajo,
                'Mantenimiento' AS tipo_evento,
                mt.fecha
         FROM mantenimiento_cooler mt
         INNER JOIN coolers c ON mt.cooler_codigo = c.codigo
         WHERE mt.orden_trabajo = $1
       ) sub
       ORDER BY codigo, fecha DESC`,
      [String(ordenTrabajo || '').trim()]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, mensaje: 'No se encontraron coolers para esa OT' });
    }

    res.json({ ok: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, mensaje: 'Error buscando coolers por OT' });
  }
});

// ======================= SERVIDOR =======================
const PORT = process.env.SERVER_PORT || 5000;

https.createServer({
  key: fs.readFileSync(new URL('./192.168.0.95-key.pem', import.meta.url)),
  cert: fs.readFileSync(new URL('./192.168.0.95.pem', import.meta.url))
}, app).listen(PORT, () => {
  console.log(`Servidor en https://192.168.0.95:${PORT}`);
});
