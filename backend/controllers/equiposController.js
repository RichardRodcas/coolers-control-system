import { pool } from '../db.js'; // conexión centralizada

// ------------------ CRUD ------------------
const crearEquipo = async (req, res) => {
  const { codigo, nombre, ubicacion, estado, cliente } = req.body;
  try {
    const ubicacionFinal = ubicacion || 'Laboratorio';
    const estadoFinal = estado || 'Operativo';

    await pool.query(
      `INSERT INTO equipos (codigo, nombre, ubicacion, estado, cliente, creado_en, actualizado_en) 
       VALUES ($1,$2,$3,$4,$5,NOW(),NOW())`,
      [codigo, nombre, ubicacionFinal, estadoFinal, cliente]
    );
    res.json({ message: 'Equipo creado correctamente' });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'El código de equipo ya existe' });
    }
    res.status(500).json({ error: 'Error al crear equipo' });
  }
};

const listarEquipos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM equipos ORDER BY codigo');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar equipos' });
  }
};

const detalleEquipo = async (req, res) => {
  const { codigo } = req.params;
  try {
    const result = await pool.query('SELECT * FROM equipos WHERE codigo=$1', [codigo]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener detalle' });
  }
};

const actualizarEquipo = async (req, res) => {
  const { codigo } = req.params;
  const { nombre, ubicacion, estado, cliente } = req.body;
  try {
    const ubicacionFinal = ubicacion || 'Laboratorio';
    const estadoFinal = estado || 'Operativo';

    const result = await pool.query(
      `UPDATE equipos 
       SET nombre=$1, ubicacion=$2, estado=$3, cliente=$4, actualizado_en=NOW() 
       WHERE codigo=$5`,
      [nombre, ubicacionFinal, estadoFinal, cliente, codigo]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado para actualizar' });
    }

    res.json({ message: 'Equipo actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar equipo' });
  }
};

const eliminarEquipo = async (req, res) => {
  const { codigo } = req.params;
  try {
    const result = await pool.query('DELETE FROM equipos WHERE codigo=$1', [codigo]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado para eliminar' });
    }
    res.json({ message: 'Equipo eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar equipo' });
  }
};

// ------------------ Ingreso de equipos ------------------
const ingresoEquipos = async (req, res) => {
  const { codigo, nombre, ubicacion, estado, cliente } = req.body;

  const ubicacionFinal = ubicacion || 'Laboratorio';
  const estadoFinal = estado || 'Operativo';

  try {
    await pool.query('BEGIN');

    await pool.query(
      `INSERT INTO equipos (codigo, nombre, ubicacion, estado, cliente, creado_en, actualizado_en) 
       VALUES ($1,$2,$3,$4,$5,NOW(),NOW())`,
      [codigo, nombre, ubicacionFinal, estadoFinal, cliente]
    );

    await pool.query(
      `INSERT INTO movimientos_equipos (codigo_equipo, tipo, detalle, fecha) 
       VALUES ($1, $2, $3, NOW())`,
      [codigo, 'Ingreso', `Ingreso inicial en ${ubicacionFinal}`]
    );

    await pool.query('COMMIT');
    res.json({ message: 'Ingreso registrado correctamente' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'El código de equipo ya existe' });
    }
    res.status(500).json({ error: 'Error al registrar ingreso' });
  }
};

// ------------------ Salida de equipos ------------------
const salidaEquipos = async (req, res) => {
  const { cliente, ss, equipos } = req.body;

  if (!cliente || !ss || !equipos || equipos.length === 0) {
    return res.status(400).json({ error: 'Datos incompletos para registrar salida' });
  }

  try {
    await pool.query('BEGIN');

    for (const eq of equipos) {
      const result = await pool.query(
        `UPDATE equipos 
         SET ubicacion=$1, cliente=$2, ss=$3, estado='En uso', actualizado_en=NOW() 
         WHERE codigo=$4`,
        ['En cliente', cliente, ss, eq.codigo]
      );

      if (result.rowCount === 0) {
        throw new Error(`Equipo ${eq.codigo} no encontrado`);
      }

      await pool.query(
        `INSERT INTO movimientos_equipos (codigo_equipo, tipo, detalle, foto_url, fecha) 
         VALUES ($1, $2, $3, $4, NOW())`,
        [eq.codigo, 'Salida', `Salida hacia ${cliente} (SS: ${ss})`, eq.fotoUrl]
      );
    }

    await pool.query('COMMIT');
    res.json({ message: 'Salida registrada correctamente' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al registrar salida', detalle: err.message });
  }
};

// ------------------ Mantenimientos ------------------
const registrarMantenimiento = async (req, res) => {
  const { codigo } = req.params;
  const { fecha, tecnico, observaciones } = req.body;

  if (!fecha || !tecnico) {
    return res.status(400).json({ error: 'Datos incompletos para mantenimiento' });
  }

  try {
    await pool.query('BEGIN');

    await pool.query(
      `INSERT INTO mantenimientos_equipos (codigo_equipo, fecha, tecnico, observaciones) 
       VALUES ($1, $2, $3, $4)`,
      [codigo, fecha, tecnico, observaciones]
    );

    const result = await pool.query(
      `UPDATE equipos SET ultimo_mantenimiento=$1, actualizado_en=NOW() WHERE codigo=$2`,
      [fecha, codigo]
    );

    if (result.rowCount === 0) {
      throw new Error(`Equipo ${codigo} no encontrado`);
    }

    await pool.query(
      `INSERT INTO movimientos_equipos (codigo_equipo, tipo, detalle, fecha) 
       VALUES ($1, $2, $3, NOW())`,
      [codigo, 'Mantenimiento', `Mantenimiento realizado por ${tecnico}`]
    );

    await pool.query('COMMIT');
    res.json({ message: 'Mantenimiento registrado correctamente' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al registrar mantenimiento', detalle: err.message });
  }
};

const listarMantenimientos = async (req, res) => {
  const { codigo } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM mantenimientos_equipos WHERE codigo_equipo=$1 ORDER BY fecha DESC',
      [codigo]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar mantenimientos' });
  }
};

// ------------------ Fotos ------------------
const subirFoto = async (req, res) => {
  try {
    const fotoUrl = `/uploads/equipos/${req.file.filename}`;

    const result = await pool.query(
      'UPDATE equipos SET foto_url=$1, actualizado_en=NOW() WHERE codigo=$2',
      [fotoUrl, req.params.codigo]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado para subir foto' });
    }

    await pool.query(
      `UPDATE movimientos_equipos
       SET foto_url=$1
       WHERE id = (
         SELECT id FROM movimientos_equipos
         WHERE codigo_equipo=$2
         ORDER BY fecha DESC
         LIMIT 1
       )`,
      [fotoUrl, req.params.codigo]
    );

    res.json({ message: 'Foto subida correctamente', fotoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar foto' });
  }
};

// ------------------ Inventario ------------------
const inventarioEquipos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.codigo,
        e.nombre,
        e.ubicacion,
        e.estado,
        e.cliente,
        e.ss,
        e.ultimo_mantenimiento,
        e.foto_url AS ultima_foto,
        m.tipo AS ultimo_movimiento,
        m.detalle AS detalle_movimiento,
        m.fecha AS fecha_movimiento,
        m.foto_url AS foto_movimiento
      FROM equipos e
      LEFT JOIN LATERAL (
        SELECT tipo, detalle, fecha, foto_url
        FROM movimientos_equipos
        WHERE codigo_equipo = e.codigo
        ORDER BY fecha DESC
        LIMIT 1
      ) m ON TRUE
      ORDER BY e.codigo;
    `);

    // Si no hay equipos, devolvemos array vacío (frontend ya lo maneja)
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener inventario' });
  }
};

// ------------------ Movimientos de un equipo ------------------
const movimientosEquipo = async (req, res) => {
  const { codigo } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM movimientos_equipos 
       WHERE codigo_equipo=$1 
       ORDER BY fecha DESC`,
      [codigo]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron movimientos para este equipo' });
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener movimientos' });
  }
};

// ------------------ Exportación en ESM ------------------
export default {
  crearEquipo,
  listarEquipos,
  detalleEquipo,
  actualizarEquipo,
  eliminarEquipo,
  ingresoEquipos,
  salidaEquipos,
  registrarMantenimiento,
  listarMantenimientos,
  subirFoto,
  inventarioEquipos,
  movimientosEquipo
};
