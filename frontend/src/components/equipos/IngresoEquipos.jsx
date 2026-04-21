import React, { useState } from 'react';
import axios from 'axios';

function IngresoEquipos() {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [estado, setEstado] = useState('operativo');
  const [cliente, setCliente] = useState('');
  const [mensaje, setMensaje] = useState('');

  const guardarEquipo = async () => {
    if (!codigo || !nombre || !ubicacion || !cliente) {
      alert("Completa todos los campos antes de guardar.");
      return;
    }

    try {
      const res = await axios.post('/api/equipos/ingreso', {
        codigo,
        nombre,
        ubicacion,
        estado,
        cliente
      });
      setMensaje("✅ Equipo registrado correctamente");
      // Limpia el formulario
      setCodigo('');
      setNombre('');
      setUbicacion('');
      setEstado('operativo');
      setCliente('');
    } catch (err) {
      console.error("Error guardando equipo", err);
      setMensaje("❌ Error al registrar el equipo");
    }
  };

  return (
    <div>
      <h2>⚙️ Ingreso de Equipos</h2>
      <input type="text" placeholder="Código QR" value={codigo} onChange={e => setCodigo(e.target.value)} />
      <input type="text" placeholder="Nombre del equipo" value={nombre} onChange={e => setNombre(e.target.value)} />
      <input type="text" placeholder="Ubicación inicial" value={ubicacion} onChange={e => setUbicacion(e.target.value)} />
      <select value={estado} onChange={e => setEstado(e.target.value)}>
        <option value="operativo">Operativo</option>
        <option value="inoperativo">Inoperativo</option>
        <option value="mantenimiento">Mantenimiento</option>
      </select>
      <input type="text" placeholder="Cliente" value={cliente} onChange={e => setCliente(e.target.value)} />
      <button onClick={guardarEquipo}>Guardar equipo</button>

      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}

export default IngresoEquipos;
