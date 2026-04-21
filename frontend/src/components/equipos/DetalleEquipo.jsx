import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DetalleEquipo({ codigo }) {
  const [equipo, setEquipo] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(true);

  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        const res = await axios.get(`/api/equipos/${codigo}`);
        setEquipo(res.data.rows?.[0] || null);
      } catch (err) {
        console.error("Error cargando detalle del equipo", err);
      }
    };

    const fetchHistorial = async () => {
      try {
        const res = await axios.get(`/api/equipos/${codigo}/movimientos`);
        setHistorial(Array.isArray(res.data) ? res.data : res.data.rows || []);
      } catch (err) {
        console.error("Error cargando historial de movimientos", err);
      } finally {
        setLoadingHistorial(false);
      }
    };

    fetchDetalle();
    fetchHistorial();
  }, [codigo]);

  if (!equipo) return <div>Cargando detalle del equipo...</div>;

  return (
    <div>
      <h2>🔎 Detalle del Equipo</h2>
      <p><strong>Código:</strong> {equipo.codigo}</p>
      <p><strong>Nombre:</strong> {equipo.nombre}</p>
      <p><strong>Ubicación actual:</strong> {equipo.ubicacion}</p>
      <p><strong>Estado:</strong> {equipo.estado}</p>
      <p><strong>Cliente:</strong> {equipo.cliente || '—'}</p>
      <p><strong>Solicitud de servicio:</strong> {equipo.ss || '—'}</p>
      <p><strong>Último mantenimiento:</strong> {equipo.ultimo_mantenimiento || '—'}</p>

      {equipo.foto_url && (
        <div>
          <h3>📷 Última foto</h3>
          <img 
            src={equipo.foto_url} 
            alt="Foto equipo" 
            style={{ width: 200, height: 150, objectFit: 'cover' }} 
          />
        </div>
      )}

      <h3>📜 Historial de movimientos</h3>
      {loadingHistorial ? (
        <p>Cargando historial...</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#1976d2', color: '#fff' }}>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Detalle</th>
              <th>Foto</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(historial) && historial.length === 0 ? (
  <tr><td colSpan="4" style={{ textAlign: 'center' }}>No hay movimientos registrados</td></tr>
) : (
  Array.isArray(historial) && historial.map((mov, index) => (
    <tr key={index}>
      <td>{new Date(mov.fecha).toLocaleString('es-PE', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })}</td>
      <td style={{
        color: mov.tipo === 'Salida' ? 'red' :
               mov.tipo === 'Ingreso' ? 'green' :
               mov.tipo === 'Mantenimiento' ? 'blue' : 'black'
      }}>
        {mov.tipo}
      </td>
      <td>{mov.detalle}</td>
      <td>
        {mov.foto_url ? (
          <img src={mov.foto_url} alt="Foto movimiento"
               style={{ width: 80, height: 60, objectFit: 'cover' }} />
        ) : '—'}
      </td>
    </tr>
  ))
)}

          </tbody>
        </table>
      )}
    </div>
  );
}

export default DetalleEquipo;
