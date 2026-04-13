// src/components/MantenimientoCooler.jsx
import React, { useState, useContext } from 'react';
import { createCooler, updateMantenimiento, deleteCooler, getDetalleCooler } from '../api.js';
import { styles } from '../styles/styles.js';
import { FaCheckCircle, FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import "../styles/App.css";
import { CardContainer } from "./CardContainer.jsx";
import { Card } from "./Card.jsx";
import { AppContext } from '../context/AppContext.js';   // ✅ Importamos el contexto

function MantenimientoCooler() {
  const { mantenimiento, setMantenimiento } = useContext(AppContext); // ✅ Estado global
  const [color, setColor] = useState('');

  const { tab, codigo, estado, observacion, mensaje, coolerActual } = mantenimiento;

  // Crear cooler
  const crearCooler = async () => {
    try {
      if (!codigo || !color) {
        setMantenimiento(prev => ({ ...prev, mensaje: '❌ Debe ingresar código y color' }));
        return;
      }
      const payload = { codigo, color };
      await createCooler(payload);
      setMantenimiento(prev => ({
        ...prev,
        mensaje: `✅ Cooler ${codigo} creado con color ${color}`,
        codigo: '',
        coolerActual: null
      }));
      setColor('');
    } catch (err) {
      setMantenimiento(prev => ({ ...prev, mensaje: '❌ Error al crear cooler' }));
      console.error(err);
    }
  };

  // Buscar cooler
  const buscarCooler = async () => {
    try {
      const codigoNorm = codigo.trim().toUpperCase();
      if (!codigoNorm) {
        setMantenimiento(prev => ({ ...prev, mensaje: '❌ Debe ingresar código' }));
        return;
      }

      const cooler = await getDetalleCooler(codigoNorm);
      if (cooler) {
        setMantenimiento(prev => ({
          ...prev,
          coolerActual: cooler,
          estado: cooler.estado || '',
          observacion: cooler.observacion || '',
          mensaje: `✅ Cooler ${codigoNorm} encontrado`
        }));
      } else {
        setMantenimiento(prev => ({ ...prev, coolerActual: null, mensaje: '❌ Cooler no encontrado' }));
      }
    } catch (err) {
      setMantenimiento(prev => ({ ...prev, coolerActual: null, mensaje: '❌ Cooler no encontrado' }));
      console.error(err);
    }
  };

  // Modificar cooler
  const modificarCooler = async () => {
    try {
      if (!codigo || !estado) {
        setMantenimiento(prev => ({ ...prev, mensaje: '❌ Debe ingresar código y estado' }));
        return;
      }
      if (estado === 'observado' && !observacion) {
        setMantenimiento(prev => ({ ...prev, mensaje: '❌ Debe ingresar observación si el cooler está observado' }));
        return;
      }
      await updateMantenimiento(codigo.trim().toUpperCase(), { estado, observacion });
      setMantenimiento(prev => ({
        ...prev,
        mensaje: `✅ Cooler ${codigo} modificado a estado ${estado}${estado === 'observado' ? ` con observación: ${observacion}` : ''}`,
        codigo: '',
        estado: '',
        observacion: '',
        coolerActual: null
      }));
    } catch (err) {
      setMantenimiento(prev => ({ ...prev, mensaje: '❌ Error al modificar cooler' }));
      console.error(err);
    }
  };

  // Eliminar cooler
  const eliminarCooler = async () => {
    try {
      if (!codigo) {
        setMantenimiento(prev => ({ ...prev, mensaje: '❌ Debe ingresar código' }));
        return;
      }
      await deleteCooler(codigo.trim().toUpperCase());
      setMantenimiento(prev => ({ ...prev, mensaje: `🗑️ Cooler ${codigo} eliminado`, codigo: '' }));
    } catch (err) {
      setMantenimiento(prev => ({ ...prev, mensaje: '❌ Error al eliminar cooler' }));
      console.error(err);
    }
  };

  return (
    <CardContainer>
      <Card>
        <h2 style={styles.title}>🛠️ Mantenimiento de Coolers</h2>

        {/* Pestañas */}
        <div style={styles.tabRow}>
          <button
            style={tab === 'crear' ? styles.activeTab : styles.tab}
            onClick={() => setMantenimiento(prev => ({ ...prev, tab: 'crear' }))}
          >
            Crear Cooler
          </button>
          <button
            style={tab === 'modificar' ? styles.activeTab : styles.tab}
            onClick={() => setMantenimiento(prev => ({ ...prev, tab: 'modificar' }))}
          >
            Modificar Cooler
          </button>
          <button
            style={tab === 'eliminar' ? styles.activeTab : styles.tab}
            onClick={() => setMantenimiento(prev => ({ ...prev, tab: 'eliminar' }))}
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
                  onChange={(e) => setMantenimiento(prev => ({ ...prev, codigo: e.target.value }))}
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
                  onChange={(e) => setMantenimiento(prev => ({ ...prev, codigo: e.target.value }))}
                />
              </div>
              <button style={styles.primaryBtn} onClick={buscarCooler}>
                Buscar
              </button>

              {coolerActual && (
                <div style={{ marginTop: 16 }}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Estado actual: {coolerActual.estado}
                    </label>
                    <select
                      style={styles.input}
                      value={estado}
                      onChange={(e) => setMantenimiento(prev => ({ ...prev, estado: e.target.value }))}
                    >
                      <option value="">Seleccione</option>
                      <option value="operativo">Operativo</option>
                      <option value="inoperativo">Inoperativo</option>
                      <option value="observado">Observado</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Último movimiento:{" "}
                      {coolerActual.ultimo_movimiento
                        ? new Date(coolerActual.ultimo_movimiento).toLocaleString()
                        : "N/A"}
                    </label>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Último mantenimiento:{" "}
                      {coolerActual.ultimo_mantenimiento
                        ? new Date(coolerActual.ultimo_mantenimiento).toLocaleString()
                        : "N/A"}
                    </label>
                  </div>

                  {estado === "observado" && (
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Observación</label>
                      <input
                        style={styles.input}
                        value={observacion}
                        onChange={(e) => setMantenimiento(prev => ({ ...prev, observacion: e.target.value }))}
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

          {tab === "eliminar" && (
            <div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Código</label>
                <input
                  style={styles.input}
                  value={codigo}
                  onChange={(e) => setMantenimiento(prev => ({ ...prev, codigo: e.target.value }))}
                />
              </div>
              <button style={styles.dangerBtn} onClick={eliminarCooler}>
                <FaTrash /> Eliminar
              </button>
            </div>
          )}
        </div>

        {/* Mensajes */}
        {mensaje && (
          <div style={mensaje.startsWith("✅") ? styles.okBox : styles.errorBox}>
            {mensaje.startsWith("✅") && <FaCheckCircle color="#2e7d32" />}
            {mensaje.startsWith("❌") && <FaExclamationTriangle color="#c62828" />}
            <span style={{ marginLeft: 8 }}>{mensaje}</span>
          </div>      
        
      )}
    </Card>
  </CardContainer>
);
}

export default MantenimientoCooler;