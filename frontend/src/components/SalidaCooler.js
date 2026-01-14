import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { salidaCoolers } from '../api';
import { FaCheckCircle, FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import { styles } from '../styles/styles';
import BarcodeScanner from './BarcodeScanner';

function SalidaCooler() {
  const [codigos, setCodigos] = useState([]);
  const [codigoInput, setCodigoInput] = useState('');
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [ordenTrabajo, setOrdenTrabajo] = useState('');
  const [feedback, setFeedback] = useState(null);

  // ✅ Cargar clientes desde el backend
  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const res = await fetch('http://localhost:5000/clientes', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (res.ok) {
          const opciones = data.data.map(c => ({
            value: c.ruc,          // el RUC será el value
            label: c.razon_social, // el nombre visible
            ...c
          }));
          setClientes(opciones);
        }
      } catch (err) {
        console.error("Error cargando clientes:", err);
      }
    };
    cargarClientes();
  }, []);

  // ✅ Agregar código manual o por scanner
  const agregarCodigo = (codigo) => {
    const limpio = (codigo || '').trim();
    if (limpio && !codigos.includes(limpio)) {
      setCodigos(prev => [...prev, limpio]);
    }
  };

  const puedeRegistrar = clienteSeleccionado && ordenTrabajo.trim() && codigos.length > 0;

  // ✅ Registrar salida enviando RUC directamente
  const registrarSalida = async () => {
    setFeedback(null);
    if (!clienteSeleccionado || !ordenTrabajo.trim()) {
      setFeedback({ tipo: 'error', mensaje: 'Cliente y OT obligatorios', errores: [] });
      return;
    }
    try {
      const data = await salidaCoolers(codigos, clienteSeleccionado.value, ordenTrabajo); // 👈 enviamos RUC

      if (data.errores && data.errores.length > 0) {
        setFeedback({ tipo: 'error', mensaje: data.mensaje, errores: data.errores });
      } else {
        setFeedback({ tipo: 'ok', mensaje: data.mensaje, errores: [] });
        setCodigos([]);
        setClienteSeleccionado(null);
        setOrdenTrabajo('');
      }
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Error al registrar salida';
      const errores = err.response?.data?.errores || [];
      setFeedback({ tipo: 'error', mensaje: msg, errores });
    }
  };

  return (
  <>
    <h2 style={styles.title}>🚚 Salida de Coolers</h2>

    {/* Bloques en paralelo */}
    <div style={styles.cardContainer}>
      {/* Bloque 1: Cliente + Orden de trabajo */}
      <div style={styles.card}>
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Cliente</label>
            <Select
              options={clientes}
              value={clienteSeleccionado}
              onChange={setClienteSeleccionado}
              placeholder="Seleccione o busque cliente..."
              isSearchable
              styles={{ container: base => ({ ...base, width: '300px' }) }}
            />
            {clienteSeleccionado && (
              <p><strong>RUC:</strong> {clienteSeleccionado.value}</p>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Orden de trabajo</label>
            <input
              style={styles.input}
              value={ordenTrabajo}
              onChange={(e) => setOrdenTrabajo(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bloque 2: Scanner + input manual */}
      <div style={styles.card}>
        <BarcodeScanner onDetected={agregarCodigo} />

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
      </div>
    </div>

    {/* Lista de códigos */}
    <div style={styles.card}>
      <h3 style={styles.subtitle}>Coolers en esta salida ({codigos.length}):</h3>
      <ul style={styles.list}>
        {codigos.map(c => {
          const error = feedback?.errores?.find(e => e.codigo === c);
          const color = error ? '#c62828' : '#2e7d32'; // rojo si error, verde si ok
          return (
            <li key={c} style={styles.listItem}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, color }}>
                {error ? <FaExclamationTriangle /> : <FaCheckCircle />} {c}
                {error && ` ⚠️ ${error.mensaje}`}
              </span>
              <button
                style={styles.deleteBtn}
                onClick={() => setCodigos(prev => prev.filter(x => x !== c))}
              >
                <FaTrash /> Quitar
              </button>
            </li>
          );
        })}
      </ul>
    </div>

    {/* Acciones + Feedback */}
    <div style={styles.card}>
      <div style={styles.actions}>
        <button
          style={puedeRegistrar ? styles.primaryBtn : styles.disabledBtn}
          onClick={registrarSalida}
          disabled={!puedeRegistrar}
        >
          <FaCheckCircle /> Registrar salida
        </button>
        <button style={styles.dangerBtn} onClick={() => setCodigos([])}>
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
    </div>
  </>
);
}

export default SalidaCooler;