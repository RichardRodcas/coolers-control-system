import React, { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../api';

function Inventario() {
  const [coolers, setCoolers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get('http://localhost:4000/coolers');
      setCoolers(res.data);
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2>Inventario General</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Código</th>
            <th>Estado</th>
            <th>Cliente</th>
            <th>Orden de Trabajo</th>
          </tr>
        </thead>
        <tbody>
          {coolers.map((c, i) => (
            <tr key={i}>
              <td>{c.codigo}</td>
              <td>{c.estado}</td>
              <td>{c.cliente}</td>
              <td>{c.ordenTrabajo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Inventario;