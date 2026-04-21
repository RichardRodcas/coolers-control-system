import React, { useState } from 'react';
import axios from 'axios';

function MantenimientoEquipos() {
  const [codigo, setCodigo] = useState('');
  const [fecha, setFecha] = useState('');
  const [tecnico, setTecnico] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [mantenimientos, setMantenimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const fetchMantenimientos = async (codigoEquipo) => {
    if (!codigoEquipo) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/equipos/${codigoEquipo}/mantenimientos`);
      setMantenimientos(Array.isArray(res.data) ? res.data : res.data.rows || []);
    } catch (err) {
      console.error("Error cargando mantenimientos", err);
      setMensaje("❌ Error al cargar historial");
    } finally {
      setLoading(false);
    }
  };

  const registrarMantenimiento = async () => {
    if (!codigo || !fecha || !tecnico) {
      alert("Completa código, fecha y técnico antes de registrar.");
      return;
    }

    try {
      await axios.post(`/api/equipos/${codigo}/mantenimiento`, {
        fecha,
        tecnico,
        observaciones
      });
      setMensaje("✅ Mantenimiento registrado correctamente");
      setFecha('');
      setTecnico('');
      setObservaciones('');
      fetchMantenimientos(codigo);
    } catch (err) {
      console.error("Error registrando mantenimiento", err);
      setMensaje("❌ Error al registrar mantenimiento");
    }
  };

  return (
    <div>
      <h2>🛠️ Mantenimiento de Equipos</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Código del equipo"
          value={codigo}
          onChange={e => setCodigo(e.target.value)}
        />
        <button onClick={() => fetchMantenimientos(codigo)}>Ver historial</button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
        <input type="text" placeholder="Técnico" value={tecnico} onChange={e => setTecnico(e.target.value)} />
        <textarea placeholder="Observaciones" value={observaciones} onChange={e => setObservaciones(e.target.value)} />
        <button onClick={registrarMantenimiento}>Registrar mantenimiento</button>
      </div>

      {mensaje && <p>{mensaje}</p>}

      <h3>📜 Historial de mantenimientos</h3>
      {loading ? (
        <p>Cargando historial...</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#1976d2', color: '#fff' }}>
            <tr>
              <th>Fecha</th>
              <th>Técnico</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {mantenimientos.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center' }}>No hay mantenimientos registrados</td>
              </tr>
            ) : (
              mantenimientos.map((m, index) => (
                <tr key={index}>
                  <td>{new Date(m.fecha).toLocaleString('es-PE', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}</td>
                  <td>{m.tecnico}</td>
                  <td>{m.observaciones}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MantenimientoEquipos;
