// src/components/SalidaCooler.jsx
import React, { useEffect, useContext, useState } from 'react';
import Select from 'react-select';
import { salidaCoolers } from '../api.js';
import { FaCheckCircle, FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import { styles } from '../styles/styles.js';
//import BarcodeScanner from './BarcodeScanner.js';
import "../styles/App.css";
import { CardContainer } from "./CardContainer.jsx";
import { Card } from "./Card.jsx";
import { AppContext } from '../context/AppContext.js';   // ✅ Importamos el contexto

function SalidaCooler() {
  const { salida, setSalida } = useContext(AppContext); // ✅ Estado global
  const { codigos, clientes, clienteSeleccionado, ordenTrabajo, feedback } = salida;
  const [codigoInput, setCodigoInput] = useState('');

  // ✅ Cargar clientes desde el backend
  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const res = await fetch('https://192.168.0.95:5000/clientes', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (res.ok) {
          const opciones = data.data.map(c => ({
            value: c.ruc,
            label: c.razon_social,
            ...c
          }));
          setSalida(prev => ({ ...prev, clientes: opciones }));
        }
      } catch (err) {
        console.error("Error cargando clientes:", err);
      }
    };
    if (clientes.length === 0) cargarClientes();
  }, [clientes.length, setSalida]);

  // ✅ Agregar código manual o por scanner
  const agregarCodigo = (codigo) => {
    const limpio = (codigo || '').trim();
    if (limpio && !codigos.includes(limpio)) {
      setSalida(prev => ({ ...prev, codigos: [...prev.codigos, limpio] }));
    }
  };

  const puedeRegistrar = clienteSeleccionado && ordenTrabajo.trim() && codigos.length > 0;

  // ✅ Registrar salida enviando RUC directamente
  const registrarSalida = async () => {
    setSalida(prev => ({ ...prev, feedback: null }));
    if (!clienteSeleccionado || !ordenTrabajo.trim()) {
      setSalida(prev => ({ ...prev, feedback: { tipo: 'error', mensaje: 'Cliente y SS obligatorios', errores: [] } }));
      return;
    }
    try {
      const data = await salidaCoolers(codigos, clienteSeleccionado.value, ordenTrabajo);

      if (data.errores && data.errores.length > 0) {
        setSalida(prev => ({ ...prev, feedback: { tipo: 'error', mensaje: data.mensaje, errores: data.errores } }));
      } else {
        setSalida({
          codigos: [],
          clientes,
          clienteSeleccionado: null,
          ordenTrabajo: '',
          feedback: { tipo: 'ok', mensaje: data.mensaje, errores: [] }
        });
      }
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Error al registrar salida';
      const errores = err.response?.data?.errores || [];
      setSalida(prev => ({ ...prev, feedback: { tipo: 'error', mensaje: msg, errores } }));
    }
  };

  return (
    <>
      <h2 style={styles.title}>🚚 Salida de Coolers</h2>

      {/* Bloques en paralelo */}
      <CardContainer>
        {/* Bloque 1: Cliente + Orden de trabajo */}
        <Card>
          <div style={{...styles.formRow, flexDirection: 'column', marginRight: 200}}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Cliente</label>
              <Select
                options={clientes}
                value={clienteSeleccionado}
                onChange={(val) => setSalida(prev => ({ ...prev, clienteSeleccionado: val }))}
                placeholder="Seleccione o busque cliente..."
                isSearchable
                styles={{ container: base => ({ ...base, width: '300px' }) }}
              />
              {clienteSeleccionado && (
                <>
                  <p><strong>Cliente:</strong> {clienteSeleccionado.label} </p>
                  <p><strong>RUC:</strong> {clienteSeleccionado.value}</p>
                </>
              )}
            </div>

            <div style={{...styles.formGroup, marginRight: 110}}>
              <label style={styles.label}>Orden de trabajo</label>
              <input
                style={styles.input}
                value={ordenTrabajo}
                onChange={(e) => setSalida(prev => ({ ...prev, ordenTrabajo: e.target.value }))}
              />
            </div>
          </div>
        </Card>

        {/* Bloque 2: Scanner + input manual */}
        <Card>
          {/* <BarcodeScanner onDetected={agregarCodigo} /> */}

          <div style={styles.formGroup}>
            <label style={styles.label}>Escriba código manualmente</label>
            <input
              style={styles.input}
              value={codigoInput}
              onChange={(e) => setCodigoInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Tab') {
                  e.preventDefault();
                  agregarCodigo(codigoInput);
                  setCodigoInput('');
                }
              }}
              placeholder="Ingrese código y presione Enter"
            />
          </div>
        </Card>
      </CardContainer>

      {/* Lista de códigos */}
      <Card>
        <h3 style={styles.subtitle}>Coolers en esta salida ({codigos.length}):</h3>
        <ul style={styles.list}>
          {codigos.map(c => {
            const error = feedback?.errores?.find(e => e.codigo === c);
            const color = error ? '#c62828' : '#2e7d32';
            return (
              <li key={c} style={styles.listItem}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, color }}>
                  {error ? <FaExclamationTriangle /> : <FaCheckCircle />} {c}
                  {error && ` ⚠️ ${error.mensaje}`}
                </span>
                <button
                  style={styles.deleteBtn}
                  onClick={() => setSalida(prev => ({ ...prev, codigos: prev.codigos.filter(x => x !== c) }))}
                >
                  <FaTrash /> Quitar
                </button>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* Acciones + Feedback */}
      <Card>
        <div style={styles.actions}>
          <button
            style={puedeRegistrar ? styles.primaryBtn : styles.disabledBtn}
            onClick={registrarSalida}
            disabled={!puedeRegistrar}
          >
            <FaCheckCircle /> Registrar salida
          </button>
          <button style={styles.dangerBtn} onClick={() => setSalida(prev => ({ ...prev, codigos: [] }))}>
            <FaTrash /> Limpiar lista
          </button>
        </div>

        {feedback && (
          <div style={feedback.tipo === 'ok' ? styles.okBox : styles.errorBox}>
            <div style={styles.feedbackHeader}>
              {feedback.tipo === 'ok' && <FaCheckCircle color="#2e7d32" />}
              {feedback.tipo === 'error' && <FaExclamationTriangle color="#c62828" />}
              <strong style={{ marginLeft: 8 }}>{feedback.mensaje}</strong>
            </div>
            {feedback.errores.length > 0 && (
              <ul style={styles.feedbackList}>
                {feedback.errores.map((d, idx) => (
                  <li key={idx} style={styles.feedbackItemErr}>
                    <span><strong>Código:</strong> {d.codigo}</span>
                    <span><strong>Mensaje:</strong> {d.mensaje}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Card>
    </>
  );
}

export default SalidaCooler;