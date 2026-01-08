import React, { useState } from 'react';
import api from '../api';
import { styles } from './styles';

function Trazabilidad() {
  const [codigo, setCodigo] = useState('');
  const [cooler, setCooler] = useState(null);

  const buscarCooler = () => {
    api.get(`/coolers/${codigo}/detalle`)
      .then(res => setCooler(res.data))
      .catch(err => {
        console.error('Error al buscar trazabilidad', err);
        setCooler(null);
      });
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>🔎 Trazabilidad de Coolers</h2>

      {/* Buscador por código */}
      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Código del cooler</label>
          <input
            style={styles.trazaInput}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Ej: MO-0003-TYP"
          />
        </div>
        <button style={styles.primaryBtn} onClick={buscarCooler}>Buscar</button>
      </div>

      {/* Ubicación actual */}
      {cooler && (
        <div style={styles.okBox}>
          <strong>Código:</strong> {cooler.codigo} <br />
          <strong>Color:</strong> {cooler.color || '-'} <br />
          <strong>Ubicación actual:</strong> {cooler.disponibilidad || '-'} <br />
          <strong>Estado:</strong> {cooler.estado || '-'} <br />
          <strong>Cliente:</strong> {cooler.cliente || '-'} <br />
          <strong>Orden de Trabajo:</strong> {cooler.ordenTrabajo || '-'}
        </div>
      )}

      {/* Historial */}
      {cooler && cooler.historial && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Fecha</th>
              <th style={styles.th}>Acción</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Disponibilidad</th>
              <th style={styles.th}>Cliente</th>
              <th style={styles.th}>OT</th>
              <th style={styles.th}>Observación</th>
            </tr>
          </thead>
          <tbody>
            {cooler.historial.map((h, i) => (
              <tr key={i}>
                <td style={styles.td}>{new Date(h.fecha).toLocaleString()}</td>
                <td style={styles.td}>{h.tipo}</td>
                <td style={styles.td}>{h.estado || '-'}</td>
                <td style={styles.td}>{h.disponibilidad || '-'}</td>
                <td style={styles.td}>{h.cliente || '-'}</td>
                <td style={styles.td}>{h.ordenTrabajo || '-'}</td>
                <td style={styles.td}>{h.observacion || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Trazabilidad;