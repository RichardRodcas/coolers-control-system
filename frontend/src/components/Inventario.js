import React, { useEffect, useState } from 'react';
import api from '../api';
import { styles } from './styles';

function Inventario() {
  const [coolers, setCoolers] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState('');

  const cargarInventario = () => {
    api.get('/coolers')
      .then(res => setCoolers(res.data))
      .catch(err => console.error('Error al cargar inventario', err));
  };

  useEffect(() => {
    cargarInventario();
  }, []);

  // aplicar filtros combinados
  const filtrados = coolers.filter(c => {
    const matchEstado = filtroEstado ? c.estado === filtroEstado : true;
    const matchDisponibilidad = filtroDisponibilidad ? c.disponibilidad === filtroDisponibilidad : true;
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
        {/* ... mismos cuadros de contadores que ya tienes ... */}
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