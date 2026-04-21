// src/components/SalidaEquipos.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';

function SalidaEquipos() {
  const [equiposSalida, setEquiposSalida] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [ss, setSS] = useState('');
  const [clientes, setClientes] = useState([]);

  // ✅ Cargar clientes desde backend
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await axios.get('https://192.168.0.95:5000/clientes', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        // res.data ya es JSON
        const opciones = Array.isArray(res.data.data)
          ? res.data.data.map(c => ({
              value: c.ruc,
              label: c.razon_social,
              ...c
            }))
          : [];
        setClientes(opciones);
      } catch (err) {
        console.error("Error cargando clientes", err);
        setClientes([]);
      }
    };
    fetchClientes();
  }, []);

  // ✅ Agregar equipo escaneado o manual
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
    if (incompletos || !clienteSeleccionado || !ss) {
      alert("Completa checklist, fotos, cliente y SS antes de guardar.");
      return;
    }

    try {
      await axios.post('/api/equipos/salida', {
        cliente: clienteSeleccionado.value, // 👈 enviamos RUC
        ss,
        equipos: equiposSalida
      });
      alert("Salida registrada correctamente");
      setEquiposSalida([]);
      setClienteSeleccionado(null);
      setSS('');
    } catch (err) {
      console.error("Error guardando salida", err);
      alert("Error al registrar salida");
    }
  };

  const toggleChecklistItem = (codigo, item) => {
    setEquiposSalida(equiposSalida.map(eq =>
      eq.codigo === codigo
        ? { ...eq, checklist: { ...eq.checklist, [item]: !eq.checklist[item] } }
        : eq
    ));
  };

  return (
    <div>
      <h2>🚚 Salida de Equipos</h2>

      <div style={{ marginBottom: 20 }}>
        <label>Cliente</label>
        <Select
          options={clientes}
          value={clienteSeleccionado}
          onChange={setClienteSeleccionado}
          placeholder="Seleccione o busque cliente..."
          isSearchable
          styles={{ container: base => ({ ...base, width: '300px' }) }}
        />
        {clienteSeleccionado && (
          <>
            <p><strong>Cliente:</strong> {clienteSeleccionado.label}</p>
            <p><strong>RUC:</strong> {clienteSeleccionado.value}</p>
          </>
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <label>Nro SS</label>
        <input
          type="text"
          placeholder="Nro SS"
          value={ss}
          onChange={e => setSS(e.target.value)}
        />
      </div>

      <hr />

      <ul>
        {Array.isArray(equiposSalida) && equiposSalida.map(eq => (
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
