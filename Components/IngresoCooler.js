import React, { useState } from 'react';
import axios from 'axios';
import api from '../api';

function IngresoCooler() {
  const [codigo, setCodigo] = useState('');
  const [cliente, setCliente] = useState('');
  const [ordenTrabajo, setOrdenTrabajo] = useState('');

  const registrarRetorno = async () => {
    try {
      const res = await axios.post('http://localhost:4000/coolers/ingreso', {
        codigo,
        cliente,
        ordenTrabajo,
        tipo: 'retorno'
      });
      alert('Cooler retornado: ' + JSON.stringify(res.data.cooler));
      setCodigo('');
      setCliente('');
      setOrdenTrabajo('');
    } catch (err) {
      alert('Error al registrar retorno');
    }
  };

  return (
    <div>
      <h2>Ingreso de Coolers (Retorno)</h2>
      <input placeholder="Código" value={codigo} onChange={e => setCodigo(e.target.value)} />
      <input placeholder="Cliente" value={cliente} onChange={e => setCliente(e.target.value)} />
      <input placeholder="Orden de Trabajo" value={ordenTrabajo} onChange={e => setOrdenTrabajo(e.target.value)} />
      <button onClick={registrarRetorno}>Registrar Retorno</button>
    </div>
  );
}

export default IngresoCooler;