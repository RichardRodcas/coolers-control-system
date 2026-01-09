import React, { useEffect, useState, useCallback } from 'react';
import { getCoolers } from '../api'; 
import { styles } from '../styles/styles';

function Inventario() {
  const [coolers, setCoolers] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 👇 usamos useCallback para memoizar la función
  const cargarInventario = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCoolers(); // Axios ya envía el token automáticamente
      setCoolers(data || []); // ✅ corregido
    } catch (err) {
      console.error('Error al cargar inventario', err);
      setError(err.response?.data?.mensaje || 'No se pudo cargar el inventario');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarInventario();
  }, [cargarInventario]);

  const filtrados = coolers.filter(c => {
    const matchEstado = filtroEstado ? c.estado?.toLowerCase() === filtroEstado : true;
    const matchDisponibilidad = filtroDisponibilidad ? c.disponibilidad?.toLowerCase() === filtroDisponibilidad : true;
    return matchEstado && matchDisponibilidad;
  });

  const contadores = {
    total: coolers.length,
    operativo: coolers.filter(c => c.estado === 'operativo').length,
    inoperativo: coolers.filter(c => c.estado === 'inoperativo').length,
    observado: coolers.filter(c => c.estado === 'observado').length,
    laboratorio: coolers.filter(c => c.disponibilidad === 'laboratorio').length,
    campo: coolers.filter(c => c.disponibilidad === 'campo').length
  };

  const colorFila = (estado) => {
    switch (estado) {
      case 'operativo': return '#e8f5e9';
      case 'observado': return '#fffde7';
      case 'inoperativo': return '#ffebee';
      default: return '#f5f5f5';
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>📦 Inventario General</h2>

      {/* Contadores */}
      <div style={styles.counterRow}>
        <div style={{ ...styles.counterBox, ...styles.counterOperativo }}>Operativos: {contadores.operativo}</div>
        <div style={{ ...styles.counterBox, ...styles.counterInoperativo }}>Inoperativos: {contadores.inoperativo}</div>
        <div style={{ ...styles.counterBox, ...styles.counterObservado }}>Observados: {contadores.observado}</div>
        <div style={{ ...styles.counterBox, ...styles.counterLaboratorio }}>Laboratorio: {contadores.laboratorio}</div>
        <div style={{ ...styles.counterBox, ...styles.counterCampo }}>Campo: {contadores.campo}</div>
        <div style={{ ...styles.counterBox, ...styles.counterTotal }}>Total: {contadores.total}</div>
      </div>

      {/* Filtros */}
      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Filtrar por estado</label>
          <select style={styles.input} value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todos</option>
            <option value="operativo">Operativo</option>
            <option value="observado">Observado</option>
            <option value="inoperativo">Inoperativo</option>
          </select>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Filtrar por disponibilidad</label>
          <select style={styles.input} value={filtroDisponibilidad} onChange={(e) => setFiltroDisponibilidad(e.target.value)}>
            <option value="">Todas</option>
            <option value="laboratorio">Laboratorio</option>
            <option value="campo">Campo</option>
          </select>
        </div>
        <button style={styles.primaryBtn} onClick={cargarInventario}>Refrescar</button>
      </div>

      {/* Mensajes */}
      {loading && <p>Cargando inventario...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {filtrados.length === 0 && !loading && !error && <p>No hay coolers que coincidan con los filtros</p>}

      {/* Tabla */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Código</th>
            <th style={styles.th}>Color</th>
            <th style={styles.th}>Estado</th>
            <th style={styles.th}>Disponibilidad</th>
            <th style={styles.th}>Observación</th>
          </tr>
        </thead>
        <tbody>
          {filtrados.map(c => (
            <tr key={c.codigo} style={{ background: colorFila(c.estado) }}>
              <td style={styles.td}>{c.codigo}</td>
              <td style={styles.td}>{c.color || '-'}</td>
              <td style={styles.td}>{c.estado}</td>
              <td style={styles.td}>{c.disponibilidad || '-'}</td>
              <td style={styles.td}>{c.observacion || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Inventario;