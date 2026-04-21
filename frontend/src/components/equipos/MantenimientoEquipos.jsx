import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MantenimientoEquipos() {
  const [codigo, setCodigo] = useState('');
  const [fecha, setFecha] = useState('');
  const [tecnico, setTecnico] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [mantenimientos, setMantenimientos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar historial de mantenimientos de un equipo
  const fetchMantenimientos = async (codigoEquipo) => {
    if (!codigoEquipo) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/equipos/${codigoEquipo}/mantenimientos`);
      setMantenimientos(res.data);
    } catch (err) {
      console.error("Error cargando mantenimientos", err);
    } finally {
      setLoading(false);
    }
  };

  // Registrar mantenimiento
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
      alert("Mantenimiento registrado correctamente");
      setFecha('');
      setTecnico('');
      setObservaciones('');
      fetchMantenimientos(codigo);
    } catch (err) {
      console.error("Error registrando mantenimiento", err);
      alert("Error al registrar mantenimiento");
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
        <input
          type="date"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
        />
        <input
          type="text"
          placeholder="Técnico"
          value={tecnico}
          onChange={e => setTecnico(e.target.value)}
        />
        <textarea
          placeholder="Observaciones"
          value={observaciones}
          onChange={e => setObservaciones(e.target.value)}
        />
        <button onClick={registrarMantenimiento}>Registrar mantenimiento</button>
      </div>

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
                  <td>{new Date(m.fecha).toLocaleDateString()}</td>
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
