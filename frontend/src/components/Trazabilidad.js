import React, { useState } from 'react';
import { getDetalleCooler } from '../api';
import { styles } from '../styles/styles';
import BarcodeScanner from './BarcodeScanner';

function Trazabilidad() {
  const [codigo, setCodigo] = useState('');
  const [cooler, setCooler] = useState(null);
  const [error, setError] = useState('');

  const buscarCooler = async () => {
    setError('');
    setCooler(null);

    if (!codigo.trim()) {
      setError('❌ Debe ingresar un código');
      return;
    }

    try {
      const data = await getDetalleCooler(codigo.trim()); // ✅ sin token
      if (!data) {
        setError(`No se encontró trazabilidad para el código ${codigo}`);
      } else {
        setCooler(data);
      }
    } catch (err) {
      console.error('Error al buscar trazabilidad', err);
      setError('❌ Error al consultar trazabilidad');
    }
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

      {/* Scanner integrado */}
      <BarcodeScanner onDetected={setCodigo} />

      {/* Mensaje de error */}
      {error && <div style={styles.errorBox}>{error}</div>}

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
        <>
          <h3 style={styles.subtitle}>Historial ({cooler.historial.length} eventos)</h3>
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
        </>
      )}
    </div>
  );
}

export default Trazabilidad;