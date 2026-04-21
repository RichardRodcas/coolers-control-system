import React, { useState } from 'react';

function IngresoEquipos() {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [estado, setEstado] = useState('operativo');
  const [cliente, setCliente] = useState('');

  const guardarEquipo = () => {
    if (!codigo || !nombre || !ubicacion || !cliente) {
      alert("Completa todos los campos antes de guardar.");
      return;
    }
    // Aquí llamas al backend para guardar el equipo
    console.log("Guardando equipo:", { codigo, nombre, ubicacion, estado, cliente });
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
    </div>
  );
}

export default IngresoEquipos;
