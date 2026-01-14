import React, { useState } from 'react';
import { createCooler, updateMantenimiento, deleteCooler, getDetalleCooler } from '../api';
import { styles } from '../styles/styles';
import { FaCheckCircle, FaExclamationTriangle, FaTrash } from 'react-icons/fa';

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
        setMensaje('❌ Debe ingresar código y color');
        return;
      }
      const payload = { codigo, color };
      await createCooler(payload);
      setMensaje(`✅ Cooler ${codigo} creado con color ${color}`);
      setCodigo('');
      setColor('');
    } catch (err) {
      setMensaje('❌ Error al crear cooler');
      console.error(err);
    }
  };

  // Buscar cooler
  const buscarCooler = async () => {
    try {
      const codigoNorm = codigo.trim().toUpperCase();
      if (!codigoNorm) {
        setMensaje('❌ Debe ingresar código');
        return;
      }

      const cooler = await getDetalleCooler(codigoNorm);
      if (cooler) {
        setCoolerActual(cooler);
        setEstado(cooler.estado || '');
        setObservacion(cooler.observacion || '');
        setMensaje(`✅ Cooler ${codigoNorm} encontrado`);
      } else {
        setCoolerActual(null);
        setMensaje('❌ Cooler no encontrado');
      }
    } catch (err) {
      setCoolerActual(null);
      setMensaje('❌ Cooler no encontrado');
      console.error(err);
    }
  };

  // Modificar cooler
  const modificarCooler = async () => {
    try {
      if (!codigo || !estado) {
        setMensaje('❌ Debe ingresar código y estado');
        return;
      }
      if (estado === 'observado' && !observacion) {
        setMensaje('❌ Debe ingresar observación si el cooler está observado');
        return;
      }
      await updateMantenimiento(codigo.trim().toUpperCase(), { estado, observacion });
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
        setMensaje('❌ Debe ingresar código');
        return;
      }
      await deleteCooler(codigo.trim().toUpperCase());
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
        <button style={tab === 'crear' ? styles.activeTab : styles.tab} onClick={() => setTab('crear')}>Crear Cooler</button>
        <button style={tab === 'modificar' ? styles.activeTab : styles.tab} onClick={() => setTab('modificar')}>Modificar Cooler</button>
        <button style={tab === 'eliminar' ? styles.activeTab : styles.tab} onClick={() => setTab('eliminar')}>Eliminar Cooler</button>
      </div>

      {/* Contenido según pestaña */}
      <div style={{ marginTop: 16 }}>
        {tab === 'crear' && (
          <div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Código</label>
              <input style={styles.input} value={codigo} onChange={(e) => setCodigo(e.target.value)} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Color</label>
              <input style={styles.input} value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
            <button style={styles.primaryBtn} onClick={crearCooler}>Crear</button>
          </div>
        )}

        {tab === 'modificar' && (
          <div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Código</label>
              <input style={styles.input} value={codigo} onChange={(e) => setCodigo(e.target.value)} />
            </div>
            <button style={styles.primaryBtn} onClick={buscarCooler}>Buscar</button>

            {coolerActual && (
              <div style={{ marginTop: 16 }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Estado actual: {coolerActual.estado}</label>
                  <select style={styles.input} value={estado} onChange={(e) => setEstado(e.target.value)}>
                    <option value="">Seleccione</option>
                    <option value="operativo">Operativo</option>
                    <option value="inoperativo">Inoperativo</option>
                    <option value="observado">Observado</option>
                  </select>
                </div>

                {/* Mostrar último movimiento y mantenimiento */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Último movimiento: {coolerActual.ultimo_movimiento ? new Date(coolerActual.ultimo_movimiento).toLocaleString() : 'N/A'}
                  </label>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Último mantenimiento: {coolerActual.ultimo_mantenimiento ? new Date(coolerActual.ultimo_mantenimiento).toLocaleString() : 'N/A'}
                  </label>
                </div>

                {estado === 'observado' && (
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Observación</label>
                    <input style={styles.input} value={observacion} onChange={(e) => setObservacion(e.target.value)} />
                  </div>
                )}
                <button style={styles.primaryBtn} onClick={modificarCooler}>Guardar cambios</button>
              </div>
            )}
          </div>
        )}

        {tab === 'eliminar' && (
          <div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Código</label>
              <input style={styles.input} value={codigo} onChange={(e) => setCodigo(e.target.value)} />
            </div>
            <button style={styles.dangerBtn} onClick={eliminarCooler}><FaTrash /> Eliminar</button>
          </div>
        )}
      </div>

      {/* Mensajes */}
      {mensaje && (
        <div style={mensaje.startsWith('✅') ? styles.okBox : styles.errorBox}>
          {mensaje.startsWith('✅') && <FaCheckCircle color="#2e7d32" />}
          {mensaje.startsWith('❌') && <FaExclamationTriangle color="#c62828" />}
          <span style={{ marginLeft: 8 }}>{mensaje}</span>
        </div>
      )}
    </div>
  );
}

export default MantenimientoCooler;