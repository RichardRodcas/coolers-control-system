import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SalidaEquipos() {
  const [equiposSalida, setEquiposSalida] = useState([]);
  const [cliente, setCliente] = useState('');
  const [ss, setSS] = useState('');
  const [clientes, setClientes] = useState([]);

  // Cargar clientes desde backend
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await axios.get('/api/clientes');
        setClientes(res.data);
      } catch (err) {
        console.error("Error cargando clientes", err);
      }
    };
    fetchClientes();
  }, []);

  // Simulación de agregar equipo escaneado por QR
  const agregarEquipo = (codigo, nombre) => {
  if (equiposSalida.some(eq => eq.codigo === codigo)) {
    alert("Este equipo ya fue agregado");
    return;
  }
  setEquiposSalida([...equiposSalida, {
    codigo,
    nombre,
    checklist: { cables: false, presion: false, limpieza: false },
    fotoUrl: null
  }]);
};


  const subirFoto = async (codigo, file) => {
    try {
      const formData = new FormData();
      formData.append('foto', file);
      const res = await axios.post(`/api/equipos/${codigo}/foto`, formData);
      setEquiposSalida(equiposSalida.map(eq =>
        eq.codigo === codigo ? { ...eq, fotoUrl: res.data.fotoUrl } : eq
      ));
    } catch (err) {
      console.error("Error subiendo foto", err);
    }
  };

  const eliminarEquipo = (codigo) => {
    setEquiposSalida(equiposSalida.filter(eq => eq.codigo !== codigo));
  };

  const guardarSalida = async () => {
    const incompletos = equiposSalida.some(eq =>
      Object.values(eq.checklist).includes(false) || !eq.fotoUrl
    );
    if (incompletos || !cliente || !ss) {
      alert("Completa checklist, fotos, cliente y SS antes de guardar.");
      return;
    }

    try {
      await axios.post('/api/equipos/salida', {
        cliente,
        ss,
        equipos: equiposSalida
      });
      alert("Salida registrada correctamente");
      setEquiposSalida([]);
      setCliente('');
      setSS('');
    } catch (err) {
      console.error("Error guardando salida", err);
      alert("Error al registrar salida");
    }
  };

  return (
    <div>
      <h2>🚚 Salida de Equipos</h2>

      <input
        type="text"
        placeholder="Nro SS"
        value={ss}
        onChange={e => setSS(e.target.value)}
      />

      <select value={cliente} onChange={e => setCliente(e.target.value)}>
        <option value="">Selecciona cliente</option>
        {clientes.map(c => (
          <option key={c.id} value={c.nombre}>{c.nombre}</option>
        ))}
      </select>

      <hr />

      <ul>
        {equiposSalida.map(eq => (
          <li key={eq.codigo} style={{ marginBottom: 20 }}>
            <strong>{eq.codigo}</strong> - {eq.nombre}

            <div>
              <label>
                <input
                  type="checkbox"
                  checked={eq.checklist.cables}
                  onChange={() => toggleChecklistItem(eq.codigo, 'cables')}
                /> Revisar cables
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={eq.checklist.presion}
                  onChange={() => toggleChecklistItem(eq.codigo, 'presion')}
                /> Verificar presión
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={eq.checklist.limpieza}
                  onChange={() => toggleChecklistItem(eq.codigo, 'limpieza')}
                /> Limpieza general
              </label>
            </div>

            <div>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={e => subirFoto(eq.codigo, e.target.files[0])}
              />
              {eq.fotoUrl ? (
  <img src={eq.fotoUrl} alt="Foto equipo" style={{ width: 80, height: 60, objectFit: 'cover' }} />
) : <span>🟡 Falta foto</span>}
            </div>

            <button onClick={() => eliminarEquipo(eq.codigo)}>❌ Eliminar</button>
          </li>
        ))}
      </ul>

      <button onClick={guardarSalida}>Guardar salida</button>
    </div>
  );
}

export default SalidaEquipos;
