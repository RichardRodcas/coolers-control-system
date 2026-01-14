import React, { useState } from 'react';
import { getTrazabilidad } from '../api';
import { styles } from '../styles/styles';
import BarcodeScanner from './BarcodeScanner';

// Función para dar color al estado
const estadoStyle = (estado) => {
  switch (estado?.toLowerCase()) {
    case 'operativo': return { color: '#2e7d32', fontWeight: 'bold' }; // verde
    case 'inoperativo': return { color: '#c62828', fontWeight: 'bold' }; // rojo
    case 'observado': return { color: '#f9a825', fontWeight: 'bold' }; // amarillo
    default: return {};
  }
};

// Función para formatear fechas
const formatFecha = (fecha) => {
  return new Date(fecha).toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

function Trazabilidad() {
  const [codigo, setCodigo] = useState('');
  const [detalle, setDetalle] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState('');

  const buscarCooler = async () => {
    setError('');
    setDetalle(null);
    setHistorial([]);

    if (!codigo.trim()) {
      setError('❌ Debe ingresar un código');
      return;
    }

    try {
      const codigoNorm = codigo.trim().toUpperCase();
      const data = await getTrazabilidad(codigoNorm);

      if (!data.detalle) {
        setError(`No se encontró el cooler ${codigoNorm}`);
      } else {
        setDetalle(data.detalle);
        setHistorial(data.historial || []);
      }
    } catch (err) {
      console.error('Error al buscar trazabilidad', err);
      setError('❌ Error al consultar trazabilidad');
    }
  };

  return (
  <>
    <h2 style={styles.title}>🔎 Trazabilidad de Coolers</h2>

    {/* Bloques en paralelo */}
    <div style={styles.cardContainer}>
      {/* Bloque 1: Buscador por código */}
      <div style={styles.card}>
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
          <button style={styles.primaryBtn} onClick={buscarCooler}>
            Buscar
          </button>
        </div>

        {/* Scanner integrado */}
        <BarcodeScanner onDetected={setCodigo} />
      </div>

      {/* Bloque 2: Detalle actual */}
      <div style={styles.card}>
        {error && <div style={styles.errorBox}>{error}</div>}

        {detalle && (
          <div style={styles.okBox}>
            <strong>Código:</strong> {detalle.codigo} <br />
            <strong>Color:</strong> {detalle.color || '-'} <br />
            <strong>Ubicación actual:</strong> {detalle.disponibilidad || '-'} <br />
            <strong>Estado:</strong>{' '}
            <span style={estadoStyle(detalle.estado)}>
              {detalle.estado || '-'}
            </span>{' '}
            <br />
            <strong>Cliente:</strong> {detalle.cliente || '-'} <br />
            <strong>Orden de Trabajo:</strong> {detalle.ordenTrabajo || '-'} <br />
            <strong>Último movimiento:</strong>{' '}
            {detalle.ultimo_movimiento ? formatFecha(detalle.ultimo_movimiento) : '-'}{' '}
            <br />
            <strong>Último mantenimiento:</strong>{' '}
            {detalle.ultimo_mantenimiento ? formatFecha(detalle.ultimo_mantenimiento) : '-'}
          </div>
        )}
      </div>
    </div>

    {/* Historial */}
    {historial.length > 0 && (
      <div style={styles.card}>
        <h3 style={styles.subtitle}>Historial ({historial.length} eventos)</h3>
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
            {historial.map((h, i) => (
              <tr key={i} style={i === 0 ? { backgroundColor: '#e3f2fd' } : {}}>
                <td style={styles.td}>{formatFecha(h.fecha)}</td>
                <td style={styles.td}>
                  {h.tipo === 'Movimiento' ? '🚚 Movimiento' : '🛠️ Mantenimiento'}
                </td>
                <td style={{ ...styles.td, ...estadoStyle(h.estado) }}>
                  {h.estado || '-'}
                </td>
                <td style={styles.td}>{h.disponibilidad || '-'}</td>
                <td style={styles.td}>{h.cliente || '-'}</td>
                <td style={styles.td}>{h.ordenTrabajo || '-'}</td>
                <td style={styles.td}>{h.observacion || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </>
);
}

export default Trazabilidad;