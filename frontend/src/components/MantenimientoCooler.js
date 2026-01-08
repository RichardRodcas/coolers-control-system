import React, { useState } from 'react';
import api from '../api';
import { styles } from './styles';

function MantenimientoCooler() {
  const [tab, setTab] = useState('crear');
  const [codigo, setCodigo] = useState('');
  const [color, setColor] = useState('');
  const [estado, setEstado] = useState('');
  const [observacion, setObservacion] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [coolerActual, setCoolerActual] = useState(null);

  // Crear cooler
  const crearCooler = async () => {
    try {
      if (!codigo || !color) {
        setMensaje('Debe ingresar código y color');
        return;
      }
      await api.post('/coolers/nuevo', { codigo, color });
      setMensaje(`✅ Cooler ${codigo} creado con color ${color}`);
      setCodigo('');
      setColor('');
    } catch (err) {
      setMensaje('❌ Error al crear cooler');
      console.error(err);
    }
  };

  // Buscar cooler antes de modificar
  const buscarCooler = async () => {
    try {
      if (!codigo) {
        setMensaje('Debe ingresar código');
        return;
      }
      // ⚠️ Tu backend devuelve historial en GET /coolers/:codigo
      // Si quieres el objeto completo, ajusta backend. Por ahora mostramos historial.
      const res = await api.get(`/coolers/${codigo}`);
      if (Array.isArray(res.data)) {
        // historial
        setCoolerActual({ estado: res.data[res.data.length - 1]?.estado || '' });
      } else {
        setCoolerActual(res.data);
      }
      setEstado(coolerActual?.estado || '');
      setObservacion(coolerActual?.observacion || '');
      setMensaje(`Cooler ${codigo} encontrado`);
    } catch (err) {
      setMensaje('❌ Cooler no encontrado');
      console.error(err);
    }
  };

  // Modificar cooler
  const modificarCooler = async () => {
    try {
      if (!codigo || !estado) {
        setMensaje('Debe ingresar código y estado');
        return;
      }
      if (estado === 'observado' && !observacion) {
        setMensaje('Debe ingresar observación si el cooler está observado');
        return;
      }
      await api.put(`/coolers/${codigo}/mantenimiento`, { estado, observacion });
      setMensaje(`✅ Cooler ${codigo} modificado a estado ${estado}${estado === 'observado' ? ` con observación: ${observacion}` : ''}`);
      setCodigo('');
      setEstado('');
      setObservacion('');
      setCoolerActual(null);
    } catch (err) {
      setMensaje('❌ Error al modificar cooler');
      console.error(err);
    }
  };

  // Eliminar cooler
  const eliminarCooler = async () => {
    try {
      if (!codigo) {
        setMensaje('Debe ingresar código');
        return;
      }
      await api.delete(`/coolers/${codigo}/mantenimiento`);
      setMensaje(`🗑️ Cooler ${codigo} eliminado`);
      setCodigo('');
    } catch (err) {
      setMensaje('❌ Error al eliminar cooler');
      console.error(err);
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>🛠️ Mantenimiento de Coolers</h2>

      {/* Pestañas */}
      <div style={styles.tabRow}>
        <button
          style={tab === 'crear' ? styles.activeTab : styles.tab}
          onClick={() => setTab('crear')}
        >
          Crear Cooler
        </button>
        <button
          style={tab === 'modificar' ? styles.activeTab : styles.tab}
          onClick={() => setTab('modificar')}
        >
          Modificar Cooler
        </button>
        <button
          style={tab === 'eliminar' ? styles.activeTab : styles.tab}
          onClick={() => setTab('eliminar')}
        >
          Eliminar Cooler
        </button>
      </div>

      {/* Contenido según pestaña */}
      <div style={{ marginTop: 16 }}>
        {tab === 'crear' && (
          <div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Código</label>
              <input
                style={styles.input}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Color</label>
              <input
                style={styles.input}
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
            <button style={styles.primaryBtn} onClick={crearCooler}>
              Crear
            </button>
          </div>
        )}

        {tab === 'modificar' && (
          <div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Código</label>
              <input
                style={styles.input}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
              />
            </div>
            <button style={styles.primaryBtn} onClick={buscarCooler}>
              Buscar
            </button>

            {coolerActual && (
              <div style={{ marginTop: 16 }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Estado actual: {coolerActual.estado}</label>
                  <select
                    style={styles.input}
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                  >
                    <option value="">Seleccione</option>
                    <option value="operativo">Operativo</option>
                    <option value="inoperativo">Inoperativo</option>
                    <option value="observado">Observado</option>
                  </select>
                </div>
                {estado === 'observado' && (
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Observación</label>
                    <input
                      style={styles.input}
                      value={observacion}
                      onChange={(e) => setObservacion(e.target.value)}
                    />
                  </div>
                )}
                <button style={styles.primaryBtn} onClick={modificarCooler}>
                  Guardar cambios
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'eliminar' && (
          <div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Código</label>
              <input
                style={styles.input}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
              />
            </div>
            <button style={styles.dangerBtn} onClick={eliminarCooler}>
              Eliminar
            </button>
          </div>
        )}
      </div>

      {/* Mensajes */}
      {mensaje && (
        <div style={{ marginTop: 16, color: '#1976d2', fontWeight: 'bold' }}>
          {mensaje}
        </div>
      )}
    </div>
  );
}

export default MantenimientoCooler;