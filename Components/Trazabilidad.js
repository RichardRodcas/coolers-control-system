import React, { useState } from 'react';
import axios from 'axios';
import api from '../api';

function Trazabilidad() {
  const [codigo, setCodigo] = useState('');
  const [historial, setHistorial] = useState([]);

  const consultarHistorial = async () => {
    try {
      const res = await axios.get(`http://localhost:4000/coolers/${codigo}`);
      setHistorial(res.data);
    } catch (err) {
      alert('Cooler no encontrado');
    }
  };

  return (
    <div>
      <h2>Trazabilidad de Cooler</h2>
      <input placeholder="Código" value={codigo} onChange={e => setCodigo(e.target.value)} />
      <button onClick={consultarHistorial}>Consultar</button>

      <ul>
        {historial.map((h, i) => (
          <li key={i}>{h.tipo} - {new Date(h.fecha).toLocaleString()}</li>
        ))}
      </ul>
    </div>
  );
}

export default Trazabilidad;