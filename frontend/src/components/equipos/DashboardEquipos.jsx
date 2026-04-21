import React, { useState, useEffect } from 'react';
import axios from 'axios';

function InventarioEquipos({ onVerDetalle }) {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const res = await axios.get('/api/equipos/inventario');
        console.log("Respuesta inventario:", res.data);
        setEquipos(Array.isArray(res.data) ? res.data :  res.data.rows || []);
      } catch (err) {
        console.error("Error cargando inventario de equipos", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipos();
  }, []);

  if (loading) return <p>Cargando inventario...</p>;

  return (
    <div>
      <h2>📦 Inventario de Equipos</h2>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#2196f3', color: '#fff' }}>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Ubicación</th>
            <th>Estado</th>
            <th>Cliente</th>
            <th>Último movimiento</th>
            <th>Fecha movimiento</th>
            <th>Foto</th>
          </tr>
        </thead>
        <tbody>
          {equipos.length === 0 ? (
            <tr><td colSpan="8" style={{ textAlign: 'center' }}>No hay equipos registrados</td></tr>
          ) : (
            equipos.map(eq => (
              <tr key={eq.codigo} style={{ cursor: 'pointer' }} onClick={() => onVerDetalle(eq.codigo)}>
                <td>{eq.codigo}</td>
                <td>{eq.nombre}</td>
                <td>{eq.ubicacion}</td>
                <td style={{ color: eq.estado === 'En uso' ? 'red' : 'green' }}>{eq.estado}</td>
                <td>{eq.cliente || '—'}</td>
                <td>{eq.ultimo_movimiento || '—'}</td>
                <td>{eq.fecha_movimiento ? new Date(eq.fecha_movimiento).toLocaleString() : '—'}</td>
                <td>
                  {eq.foto_movimiento || eq.ultima_foto ? (
                    <img src={eq.foto_movimiento || eq.ultima_foto} alt="Foto equipo"
                      style={{ width: 80, height: 60, objectFit: 'cover' }} />
                  ) : '—'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default InventarioEquipos;
