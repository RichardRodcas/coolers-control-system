import React, { useState, useContext } from 'react';
import { getTrazabilidad } from '../api.js';
import { styles } from '../styles/styles.js';
import BarcodeScanner from './BarcodeScanner.js';
import "../styles/App.css";
import { CardContainer } from "./CardContainer.jsx";
import { Card } from "./Card.jsx";
import { AppContext } from '../context/AppContext.js';

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

  // ✅ Usamos el contexto global en vez de useState local
  const { trazabilidad, setTrazabilidad } = useContext(AppContext);

  const buscarCooler = async () => {
    // Reiniciamos estado global
    setTrazabilidad({ detalle: null, historial: [], error: '' });

    if (!codigo.trim()) {
      setTrazabilidad({ detalle: null, historial: [], error: '❌ Debe ingresar un código' });
      return;
    }

    try {
      const codigoNorm = codigo.trim().toUpperCase();
      const data = await getTrazabilidad(codigoNorm);

      if (!data.detalle) {
        setTrazabilidad({ detalle: null, historial: [], error: `No se encontró el cooler ${codigoNorm}` });
      } else {
        // Tomar el último evento del historial para completar detalle
        const ultimoEvento = data.historial?.[0] || {};
        const detalle = {
          ...data.detalle,
          cliente: ultimoEvento.cliente || data.detalle.cliente,
          ordenTrabajo: ultimoEvento.ordenTrabajo || data.detalle.ordenTrabajo,
          ultimo_movimiento: ultimoEvento.fecha || data.detalle.ultimo_movimiento,
          ultimo_mantenimiento: data.detalle.ultimo_mantenimiento
        };
        setTrazabilidad({ detalle, historial: data.historial || [], error: '' });
      }
    } catch (err) {
      console.error('Error al buscar trazabilidad', err);
      setTrazabilidad({ detalle: null, historial: [], error: '❌ Error al consultar trazabilidad' });
    }
  };

  return (
    <>
      <h2 style={styles.title}>🔎 Trazabilidad de Coolers</h2>

      <CardContainer>
        {/* Bloque 1: Buscador por código */}
        <Card>
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

          <BarcodeScanner onDetected={setCodigo} />
        </Card>

        {/* Bloque 2: Detalle actual */}
        <Card>
          {trazabilidad.error && <div className="errorBox">{trazabilidad.error}</div>}

          {trazabilidad.detalle && (
            <div className="okBox">
              <dl>
                <dt>Código:</dt><dd>{trazabilidad.detalle.codigo}</dd>
                <dt>Color:</dt><dd>{trazabilidad.detalle.color || '-'}</dd>
                <dt>Ubicación actual:</dt><dd>{trazabilidad.detalle.disponibilidad || '-'}</dd>
                <dt>Estado:</dt>
                <dd><span style={estadoStyle(trazabilidad.detalle.estado)}>{trazabilidad.detalle.estado || '-'}</span></dd>
                <dt>Cliente:</dt><dd>{trazabilidad.detalle.cliente || '-'}</dd>
                <dt>Orden de Trabajo:</dt><dd>{trazabilidad.detalle.ordenTrabajo || '-'}</dd>
                <dt>Último movimiento:</dt>
                <dd>{trazabilidad.detalle.ultimo_movimiento ? formatFecha(trazabilidad.detalle.ultimo_movimiento) : '-'}</dd>
                <dt>Último mantenimiento:</dt>
                <dd>{trazabilidad.detalle.ultimo_mantenimiento ? formatFecha(trazabilidad.detalle.ultimo_mantenimiento) : '-'}</dd>
              </dl>
            </div>
          )}
        </Card>
      </CardContainer>

      {/* Historial */}
      {trazabilidad.historial?.length > 0 && (
        <Card>
          <h3 style={styles.subtitle}>Historial ({trazabilidad.historial.length} eventos)</h3>
          <div style={{ overflowX: "auto" }}>
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
                {trazabilidad.historial.map((h, i) => (
                  <tr key={i} style={i === 0 ? { backgroundColor: "#e3f2fd" } : {}}>
                    <td style={styles.td}>{formatFecha(h.fecha)}</td>
                    <td style={styles.td}>
                      {h.tipo === "Movimiento" ? "🚚 Movimiento" : "🛠️ Mantenimiento"}
                    </td>
                    <td style={{ ...styles.td, ...estadoStyle(h.estado) }}>
                      {h.estado || "-"}
                    </td>
                    <td style={styles.td}>{h.disponibilidad || "-"}</td>
                    <td style={styles.td}>{h.cliente || "-"}</td>
                    <td style={styles.td}>{h.ordenTrabajo || "-"}</td>
                    <td style={styles.td}>{h.observacion || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}

export default Trazabilidad;