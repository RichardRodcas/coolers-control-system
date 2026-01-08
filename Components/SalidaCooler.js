import React, { useState } from 'react';
import axios from 'axios';
import api from '../api';

function SalidaCooler() {
  const [codigo, setCodigo] = useState('');
  const [cliente, setCliente] = useState('');
  const [ordenTrabajo, setOrdenTrabajo] = useState('');

  const registrarSalida = async () => {
    try {
      const res = await axios.post('http://localhost:4000/coolers/salida', {
        codigo,
        cliente,
        ordenTrabajo
      });
      alert('Cooler salió: ' + JSON.stringify(res.data.cooler));
      setCodigo('');
      setCliente('');
      setOrdenTrabajo('');
    } catch (err) {
      alert('Error al registrar salida');
    }
  };

  return (
    <div>
      <h2>Salida de Cooler</h2>
      <input placeholder="Código" value={codigo} onChange={e => setCodigo(e.target.value)} />
      <input placeholder="Cliente" value={cliente} onChange={e => setCliente(e.target.value)} />
      <input placeholder="Orden de Trabajo" value={ordenTrabajo} onChange={e => setOrdenTrabajo(e.target.value)} />
      <button onClick={registrarSalida}>Registrar Salida</button>
    </div>
  );
}

export default SalidaCooler;