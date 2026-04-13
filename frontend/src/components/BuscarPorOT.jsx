import React, { useState, useContext } from 'react';
import { styles } from '../styles/styles.js';
import { CardContainer } from "./CardContainer.jsx";
import { Card } from "./Card.jsx";
import { AppContext } from '../context/AppContext.js';   // ✅ Importamos el contexto

// Función para dar color al estado
const estadoStyle = (estado) => {
  switch (estado?.toLowerCase()) {
    case 'operativo': return { color: '#2e7d32', fontWeight: 'bold' };
    case 'inoperativo': return { color: '#c62828', fontWeight: 'bold' };
    case 'observado': return { color: '#f9a825', fontWeight: 'bold' };
    default: return {};
  }
};

function BuscarPorOT({ userRole }) {
  const [ordenTrabajo, setOrdenTrabajo] = useState('');

  // ✅ Usamos el contexto global en vez de useState local
  const { buscarOT, setBuscarOT } = useContext(AppContext);

  const buscarCoolers = async () => {
    setBuscarOT({ resultados: [], error: '' });

    if (!ordenTrabajo.trim()) {
      setBuscarOT({ resultados: [], error: '❌ Debe ingresar una Orden de Trabajo' });
      return;
    }

    try {
      const res = await fetch(`https://192.168.0.95:5000/coolers/por-ot/${ordenTrabajo}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await res.json();
      if (!data.ok) {
        setBuscarOT({ resultados: [], error: data.mensaje || 'Error en la búsqueda' });
      } else {
        setBuscarOT({ resultados: data.data, error: '' });
      }
    } catch (err) {
      console.error(err);
      setBuscarOT({ resultados: [], error: '❌ Error consultando coolers por OT' });
    }
  };

  // Solo admins ven este módulo
  if (userRole !== 'admin') return null;

  return (
    <>
      <h2 style={styles.title}>📋 Coolers en campo por Orden de Trabajo</h2>
      <CardContainer>
        <Card>
          <div style={styles.formRow}>
            <input
              style={styles.trazaInput}
              value={ordenTrabajo}
              onChange={(e) => setOrdenTrabajo(e.target.value)}
              placeholder="Ej: SS-001"
            />
            <button style={styles.primaryBtn} onClick={buscarCoolers}>
              Buscar
            </button>
          </div>

          {buscarOT.error && <div className="errorBox">{buscarOT.error}</div>}

          {buscarOT.resultados?.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Código</th>
                    <th style={styles.th}>Color</th>
                    <th style={styles.th}>Estado</th>
                    <th style={styles.th}>Disponibilidad</th>
                    <th style={styles.th}>Cliente</th>
                    <th style={styles.th}>OT</th>
                  </tr>
                </thead>
                <tbody>
                  {buscarOT.resultados.map((c, i) => (
                    <tr key={i}>
                      <td style={styles.td}>{c.codigo}</td>
                      <td style={styles.td}>{c.color}</td>
                      <td style={{ ...styles.td, ...estadoStyle(c.estado) }}>{c.estado}</td>
                      <td style={styles.td}>{c.disponibilidad}</td>
                      <td style={styles.td}>{c.cliente}</td>
                      <td style={styles.td}>{c.orden_trabajo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </CardContainer>
    </>
  );
}

export default BuscarPorOT;