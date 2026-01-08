import React, { useState } from 'react';
import axios from 'axios';
import api from '../api';

function MantenimientoCooler() {
  const [codigo, setCodigo] = useState('');
  const [estado, setEstado] = useState('operativo');
  const [observacion, setObservacion] = useState('');

  const registrarNuevo = async () => {
    try {
      const res = await axios.post('http://localhost:4000/coolers/nuevo', {
        codigo,
        estado,
        observacion
      });
      alert('Nuevo cooler registrado: ' + JSON.stringify(res.data.cooler));
      setCodigo('');
      setEstado('operativo');
      setObservacion('');
    } catch (err) {
      alert('Error al registrar nuevo cooler');
    }
  };

  const actualizarEstado = async () => {
    try {
      const res = await axios.put(`http://localhost:4000/coolers/${codigo}/estado`, {
        estado,
        observacion
      });
      alert('Estado actualizado: ' + JSON.stringify(res.data.cooler));
      setCodigo('');
      setEstado('operativo');
      setObservacion('');
    } catch (err) {
      alert('Error al actualizar estado');
    }
  };

  return (
    <div>
      <h2>Mantenimiento de Coolers</h2>
      <input placeholder="Código" value={codigo} onChange={e => setCodigo(e.target.value)} />
      <select value={estado} onChange={e => setEstado(e.target.value)}>
        <option value="operativo">Operativo</option>
        <option value="inoperativo">Inoperativo</option>
        <option value="observado">Observado</option>
      </select>
      {estado === 'observado' && (
        <input placeholder="Observación" value={observacion} onChange={e => setObservacion(e.target.value)} />
      )}
      <div>
        <button onClick={registrarNuevo}>Registrar Nuevo Cooler</button>
        <button onClick={actualizarEstado}>Actualizar Estado</button>
      </div>
    </div>
  );
}

export default MantenimientoCooler;