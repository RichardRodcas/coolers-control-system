import { useState, useEffect } from 'react';
import { getClientes, getSS, getCoolersPorOT } from '../api.js';

export default function BuscarPorOT() {
  const [ot, setOt] = useState('');
  const [clientes, setClientes] = useState([]);
  const [clienteRuc, setClienteRuc] = useState('');
  const [ssList, setSsList] = useState([]);
  const [coolers, setCoolers] = useState([]);

  // Cargar clientes
  useEffect(() => {
    getClientes()
      .then(setClientes)
      .catch(err => {
        console.error('Error cargando clientes', err);
        setClientes([]);
      });
  }, []);

  // Cargar SS filtradas por cliente y sin duplicados
  useEffect(() => {
    getSS(clienteRuc)
      .then(data => {
        const unique = [];
        const seen = new Set();
        for (const ss of data) {
          if (!seen.has(ss.orden_trabajo)) {
            seen.add(ss.orden_trabajo);
            unique.push(ss);
          }
        }
        setSsList(unique);
      })
      .catch(err => {
        console.error('Error cargando SS', err);
        setSsList([]);
      });
  }, [clienteRuc]);

  const handleBuscar = async (ordenTrabajo) => {
    if (!ordenTrabajo) return;
    try {
      const data = await getCoolersPorOT(ordenTrabajo);
      setCoolers(data || []);
    } catch (err) {
      console.error('Error al buscar coolers por OT', err);
      setCoolers([]);
    }
  };

  return (
    <div className="buscar-por-ot">
      {/* Cuadro de búsqueda manual */}
      <div className="busqueda">
        <input 
          type="text" 
          value={ot} 
          onChange={e => setOt(e.target.value)} 
          placeholder="Ingrese número de OT"
        />
        <button onClick={() => handleBuscar(ot)}>Buscar</button>
      </div>

      {/* Tabla de coolers */}
      {coolers.length > 0 && (
        <div className="coolers">
          <h2>Coolers asociados a la SS</h2>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Color</th>
                <th>Estado</th>
                <th>Disponibilidad</th>
                <th>Cliente</th>
                <th>SS</th>
                <th>Evento</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
  {coolers.map(c => {
    let bgColor = "inherit";

    if (c.disponibilidad?.toLowerCase() === "laboratorio") {
      bgColor = "#c8e6c9"; // verde claro
    } else if (c.disponibilidad?.toLowerCase() === "muestras recibidas") {
      bgColor = "#c8e6c9"; // verde claro
    } else if (c.disponibilidad?.toLowerCase() === "campo") {
      bgColor = "#fff59d"; // amarillo claro
    }

    return (
      <tr key={c.codigo} style={{ backgroundColor: bgColor }}>
        <td>{c.codigo}</td>
        <td>{c.color}</td>
        <td>{c.estado}</td>
        <td>{c.disponibilidad}</td>
        <td>{c.cliente || '-'}</td>
        <td>{c.orden_trabajo}</td>
        <td>{c.tipo_evento}</td>
        <td>{new Date(c.fecha).toLocaleString()}</td>
      </tr>
    );
  })}
</tbody>


          </table>
        </div>
      )}

      {/* Filtro por cliente */}
      <div className="filtro-cliente">
        <label>Filtrar por cliente: </label>
        <select value={clienteRuc} onChange={e => setClienteRuc(e.target.value)}>
          <option value="">Todos</option>
          {clientes.map(c => (
            <option key={c.ruc} value={c.ruc}>{c.razon_social}</option>
          ))}
        </select>
      </div>

      {/* Lista de SS con scroll */}
      <h3>Solicitudes de servicio</h3>
      <div className="ss-container">
        <ul className="ss-list">
          {ssList.map(ss => (
            <li 
              key={ss.id} 
              onClick={() => handleBuscar(ss.orden_trabajo)}
            >
              <span className="ot">{ss.orden_trabajo}</span>
              <span className="cliente">{ss.cliente}</span>
              <span className="fecha">{new Date(ss.fecha_salida).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
