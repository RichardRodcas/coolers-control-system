// src/components/Inventario.jsx
import React, { useEffect, useState, useCallback, useContext } from 'react';
import { getCoolers, getTrazabilidad } from '../api.js'; 
import { styles } from '../styles/styles.js';
import "../styles/App.css";
import { AppContext } from '../context/AppContext.js';   // ✅ Importamos el contexto

function Inventario() {
  const { inventario, setInventario, setTrazabilidad, setOpenTrazabilidad } = useContext(AppContext);  // ✅ Estado global
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cargarInventario = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCoolers();
      setInventario(data || []);   // ✅ Guardamos en contexto global
    } catch (err) {
      console.error('Error al cargar inventario', err);
      if (err.response?.status === 401) {

      setError(err.response?.data?.mensaje || 'No se pudo cargar el inventario');}
    } finally {
      setLoading(false);
    }
  }, [setInventario]);

  const exportarCSV = () => {
    if (!inventario || inventario.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const headers = ['Código', 'Cliente', 'Color', 'Estado', 'Disponibilidad', 'Observación'];
    const rows = inventario.map((c) => [
      c.codigo,
      c.cliente || '-',
      c.color || '-',
      c.estado || '-',
      c.disponibilidad || '-',
      c.observacion || '-',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventario_coolers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    // Solo cargamos si inventario está vacío, para no sobreescribir al volver
    if (!inventario || inventario.length === 0) {
      cargarInventario();
    }
  }, [cargarInventario, inventario]);

  const filtrados = inventario.filter(c => {
    const matchEstado = filtroEstado 
      ? c.estado?.toLowerCase() === filtroEstado.toLowerCase() 
      : true;
    const matchDisponibilidad = filtroDisponibilidad 
      ? c.disponibilidad?.toLowerCase() === filtroDisponibilidad.toLowerCase() 
      : true;
    return matchEstado && matchDisponibilidad;
  });

  const handleRowClick = async (codigo) => {
    if (!codigo) return;
    try {
      const codigoNorm = String(codigo).trim().toUpperCase();
      const data = await getTrazabilidad(codigoNorm);

      if (!data || !data.detalle) {
        setTrazabilidad({ detalle: null, historial: [], error: `No se encontró el cooler ${codigoNorm}` });
      } else {
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

      // Indica al dashboard que abra la vista de trazabilidad
      setOpenTrazabilidad(true);
    } catch (err) {
      console.error('Error cargando trazabilidad desde Inventario', err);
      setTrazabilidad({ detalle: null, historial: [], error: 'Error al cargar trazabilidad' });
      setOpenTrazabilidad(true);
    }
  };

  const contadores = {
    total: inventario.length,
    operativo: inventario.filter(c => c.estado?.toLowerCase() === 'operativo').length,
    inoperativo: inventario.filter(c => c.estado?.toLowerCase() === 'inoperativo').length,
    observado: inventario.filter(c => c.estado?.toLowerCase() === 'observado').length,
    laboratorio: inventario.filter(c => c.disponibilidad?.toLowerCase() === 'laboratorio').length,
    campo: inventario.filter(c => c.disponibilidad?.toLowerCase() === 'campo').length,
    recepcionMuestras: inventario.filter(c => c.disponibilidad?.toLowerCase() === 'muestras recibidas').length
  };

  const colorFila = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'operativo': return '#e8f5e9';
      case 'observado': return '#fffde7';
      case 'inoperativo': return '#ffebee';
      default: return '#f5f5f5';
    }
  };

  return (
    <>
      <h2 style={styles.title}>📦 Inventario General</h2>

      {/* Contadores + Filtros */}
      <div style={styles.cardContainer}>
        <div style={styles.card}>
          <div style={styles.counterRow}>
            <div style={{ ...styles.counterBox, ...styles.counterOperativo }}>Operativos: {contadores.operativo}</div>
            <div style={{ ...styles.counterBox, ...styles.counterInoperativo }}>Inoperativos: {contadores.inoperativo}</div>
            <div style={{ ...styles.counterBox, ...styles.counterObservado }}>Observados: {contadores.observado}</div>
            <div style={{ ...styles.counterBox, ...styles.counterLaboratorio }}>Laboratorio: {contadores.laboratorio}</div>
            <div style={{ ...styles.counterBox, ...styles.counterCampo }}>Campo: {contadores.campo}</div>
            <div style={{ ...styles.counterBox, ...styles.counterRecepcion }}>Recepción de Muestras: {contadores.recepcionMuestras}</div>
            <div style={{ ...styles.counterBox, ...styles.counterTotal }}>Total: {contadores.total}</div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Filtrar por estado</label>
              <select 
                style={styles.input} 
                value={filtroEstado} 
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="operativo">Operativo</option>
                <option value="observado">Observado</option>
                <option value="inoperativo">Inoperativo</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Filtrar por disponibilidad</label>
              <select 
                style={styles.input} 
                value={filtroDisponibilidad} 
                onChange={(e) => setFiltroDisponibilidad(e.target.value)}
              >
                <option value="">Todas</option>
                <option value="laboratorio">Laboratorio</option>
                <option value="campo">Campo</option>
                <option value="muestras recibidas">Recepción de Muestras</option>
              </select>
            </div>
            <button 
              style={styles.primaryBtn} 
              onClick={cargarInventario}
            >
              Refrescar
            </button>
            <button
              style={{ ...styles.primaryBtn, backgroundColor: '#28a745', marginLeft: 8 }}
              onClick={exportarCSV}
            >
              Exportar CSV
            </button>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      {loading && <p>Cargando inventario...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {filtrados.length === 0 && !loading && !error && <p>No hay coolers que coincidan con los filtros</p>}

      {/* Tabla con scroll */}
      <div style={styles.card}>
        <div style={styles.tableScroll}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Código</th>
                <th style={styles.th}>Cliente</th>
                <th style={styles.th}>Color</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Disponibilidad</th>
                <th style={styles.th}>Observación</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((c) => (
                <tr
                  key={c.codigo}
                  onClick={() => handleRowClick(c.codigo)}
                  style={{
                    background: colorFila(c.estado),
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = '#e8f0ff')}
                  onMouseOut={(e) => (e.currentTarget.style.background = colorFila(c.estado))}
                >
                  <td style={styles.td}>{c.codigo}</td>
                  <td style={styles.td}>{c.cliente || "-"}</td>
                  <td style={styles.td}>{c.color || "-"}</td>
                  <td style={styles.td}>{c.estado}</td>
                  <td
                    style={{
                      ...styles.td,
                      color: c.disponibilidad?.toLowerCase() === "campo" ? "orange" : "inherit",
                      fontWeight: c.disponibilidad?.toLowerCase() === "campo" ? "bold" : "normal"
                    }}
                  >
                    {c.disponibilidad || "-"}
                  </td>

                  <td style={styles.td}>{c.observacion || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Inventario;