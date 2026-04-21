// src/components/MantenimientoEquipos.jsx
import React, { useState, useContext } from 'react';
import { createEquipo, updateEquipo, deleteEquipo, getDetalleEquipo } from '../api.js';
import { styles } from '../styles/styles.js';
import { FaCheckCircle, FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import "../styles/App.css";
import { CardContainer } from "./CardContainer.jsx";
import { Card } from "./Card.jsx";
import { AppContext } from '../context/AppContext.js';

function MantenimientoEquipos() {
  const { mantenimiento, setMantenimiento } = useContext(AppContext);
  const [form, setForm] = useState({
    nombre: '', ubicacion: '', estado: 'operativo',
    cliente: '', ss: '', nroSerie: '', marca: '', fotoUrl: ''
  });

  const { tab, codigo, estado, observacion, mensaje, equipoActual } = mantenimiento;

  // Crear equipo
  const crearEquipo = async () => {
    try {
      if (!codigo || !form.nombre) {
        setMantenimiento(prev => ({ ...prev, mensaje: '❌ Debe ingresar código y nombre' }));
        return;
      }
      const payload = { codigo, ...form };
      await createEquipo(payload);
      setMantenimiento(prev => ({
        ...prev,
        mensaje: `✅ Equipo ${codigo} creado`,
        codigo: '', equipoActual: null
      }));
      setForm({ nombre:'', ubicacion:'', estado:'operativo', cliente:'', ss:'', nroSerie:'', marca:'', fotoUrl:'' });
    } catch (err) {
      setMantenimiento(prev => ({ ...prev, mensaje: '❌ Error al crear equipo' }));
      console.error(err);
    }
  };

  // Buscar equipo
  const buscarEquipo = async () => {
    try {
      const codigoNorm = codigo.trim().toUpperCase();
      if (!codigoNorm) {
        setMantenimiento(prev => ({ ...prev, mensaje: '❌ Debe ingresar código' }));
        return;
      }
      const equipo = await getDetalleEquipo(codigoNorm);
      if (equipo) {
        setMantenimiento(prev => ({
          ...prev,
          equipoActual: equipo,
          estado: equipo.estado || '',
          observacion: equipo.observacion || '',
          mensaje: `✅ Equipo ${codigoNorm} encontrado`
        }));
      } else {
        setMantenimiento(prev => ({ ...prev, equipoActual: null, mensaje: '❌ Equipo no encontrado' }));
      }
    } catch (err) {
      setMantenimiento(prev => ({ ...prev, equipoActual: null, mensaje: '❌ Error al buscar equipo' }));
      console.error(err);
    }
  };

  // Modificar equipo
  const modificarEquipo = async () => {
    try {
      if (!codigo || !estado) {
        setMantenimiento(prev => ({ ...prev, mensaje: '❌ Debe ingresar código y estado' }));
        return;
      }
      await updateEquipo(codigo.trim().toUpperCase(), { estado, observacion });
      setMantenimiento(prev => ({
        ...prev,
        mensaje: `✅ Equipo ${codigo} modificado a estado ${estado}`,
        codigo: '', estado: '', observacion: '', equipoActual: null
      }));
    } catch (err) {
      setMantenimiento(prev => ({ ...prev, mensaje: '❌ Error al modificar equipo' }));
      console.error(err);
    }
  };

  // Eliminar equipo
  const eliminarEquipo = async () => {
    try {
      if (!codigo) {
        setMantenimiento(prev => ({ ...prev, mensaje: '❌ Debe ingresar código' }));
        return;
      }
      await deleteEquipo(codigo.trim().toUpperCase());
      setMantenimiento(prev => ({ ...prev, mensaje: `🗑️ Equipo ${codigo} eliminado`, codigo: '' }));
    } catch (err) {
      setMantenimiento(prev => ({ ...prev, mensaje: '❌ Error al eliminar equipo' }));
      console.error(err);
    }
  };

  return (
    <CardContainer>
      <Card>
        <h2 style={styles.title}>🛠️ Mantenimiento de Equipos</h2>

        {/* Pestañas */}
        <div style={styles.tabRow}>
          <button style={tab==='crear'?styles.activeTab:styles.tab} onClick={()=>setMantenimiento(prev=>({...prev,tab:'crear'}))}>Crear Equipo</button>
          <button style={tab==='modificar'?styles.activeTab:styles.tab} onClick={()=>setMantenimiento(prev=>({...prev,tab:'modificar'}))}>Modificar Equipo</button>
          <button style={tab==='eliminar'?styles.activeTab:styles.tab} onClick={()=>setMantenimiento(prev=>({...prev,tab:'eliminar'}))}>Eliminar Equipo</button>
        </div>

        {/* Contenido según pestaña */}
        <div style={{marginTop:16}}>
          {tab==='crear' && (
            <div>
              <input style={styles.input} placeholder="Código" value={codigo} onChange={e=>setMantenimiento(prev=>({...prev,codigo:e.target.value}))}/>
              <input style={styles.input} placeholder="Nombre" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})}/>
              <input style={styles.input} placeholder="Ubicación" value={form.ubicacion} onChange={e=>setForm({...form,ubicacion:e.target.value})}/>
              <select style={styles.input} value={form.estado} onChange={e=>setForm({...form,estado:e.target.value})}>
                <option value="operativo">Operativo</option>
                <option value="inoperativo">Inoperativo</option>
                <option value="observado">Observado</option>
              </select>
              <input style={styles.input} placeholder="Cliente" value={form.cliente} onChange={e=>setForm({...form,cliente:e.target.value})}/>
              <input style={styles.input} placeholder="Solicitud de servicio" value={form.ss} onChange={e=>setForm({...form,ss:e.target.value})}/>
              <input style={styles.input} placeholder="Nro de serie" value={form.nroSerie} onChange={e=>setForm({...form,nroSerie:e.target.value})}/>
              <input style={styles.input} placeholder="Marca" value={form.marca} onChange={e=>setForm({...form,marca:e.target.value})}/>
              <input style={styles.input} placeholder="Foto URL" value={form.fotoUrl} onChange={e=>setForm({...form,fotoUrl:e.target.value})}/>
              <button style={styles.primaryBtn} onClick={crearEquipo}>Crear</button>
            </div>
          )}

          {tab==='modificar' && (
            <div>
              <input style={styles.input} placeholder="Código" value={codigo} onChange={e=>setMantenimiento(prev=>({...prev,codigo:e.target.value}))}/>
              <button style={styles.primaryBtn} onClick={buscarEquipo}>Buscar</button>
              {equipoActual && (
                <div style={{marginTop:16}}>
                  <label>Estado actual: {equipoActual.estado}</label>
                  <select style={styles.input} value={estado} onChange={e=>setMantenimiento(prev=>({...prev,estado:e.target.value}))}>
                    <option value="">Seleccione</option>
                    <option value="operativo">Operativo</option>
                    <option value="inoperativo">Inoperativo</option>
                    <option value="observado">Observado</option>
                  </select>
                  {estado==='observado' && (
                    <input style={styles.input} placeholder="Observación" value={observacion} onChange={e=>setMantenimiento(prev=>({...prev,observacion:e.target.value}))}/>
                  )}
                  <button style={styles.primaryBtn} onClick={modificarEquipo}>Guardar cambios</button>
                </div>
              )}
            </div>
          )}

          {tab==='eliminar' && (
            <div>
              <input style={styles.input} placeholder="Código" value={codigo} onChange={e=>setMantenimiento(prev=>({...prev,codigo:e.target.value}))}/>
              <button style={styles.dangerBtn} onClick={eliminarEquipo}><FaTrash/> Eliminar</button>
            </div>
          )}
        </div>

        {/* Mensajes */}
        {mensaje && (
          <div style={mensaje.startsWith("✅") ? styles.okBox : styles.errorBox}>
            {mensaje.startsWith("✅") && <FaCheckCircle color="#2e7d32" />}
            {mensaje.startsWith("❌") && <FaExclamationTriangle color="#c62828" />}
            <span style={{ marginLeft: 8 }}>{mensaje}</span>
          </div>
        )}
      </Card>
    </CardContainer>
  );
}

export default MantenimientoEquipos;
