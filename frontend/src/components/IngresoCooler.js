import React, { useState } from 'react';
import { ingresoCoolers } from '../api';
import { FaCheckCircle, FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import { styles } from '../styles/styles';
import BarcodeScanner from './BarcodeScanner';

function IngresoCooler() {
  const [codigos, setCodigos] = useState([]);
  const [codigoInput, setCodigoInput] = useState('');
  const [feedback, setFeedback] = useState(null);

  const agregarCodigo = (codigo) => {
    const limpio = (codigo || '').trim();
    if (limpio && !codigos.includes(limpio)) {
      setCodigos(prev => [...prev, limpio]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      agregarCodigo(codigoInput);
      setCodigoInput('');
    }
  };

  const quitarCodigo = (codigo) => {
    setCodigos(prev => prev.filter(c => c !== codigo));
  };

  const limpiarLista = () => {
    if (codigos.length === 0) return;
    if (window.confirm(`¿Seguro que quieres borrar los ${codigos.length} códigos?`)) {
      setCodigos([]);
      setCodigoInput('');
    }
  };

  const puedeRegistrar = codigos.length > 0;

  const registrarIngreso = async () => {
    setFeedback(null);

    if (codigos.length === 0) {
      setFeedback({ tipo: 'error', mensaje: 'Debes ingresar al menos un código', errores: [] });
      return;
    }

    try {
      const data = await ingresoCoolers(codigos); // ✅ sin token

      if (data.errores && data.errores.length > 0) {
        setFeedback({ tipo: 'error', mensaje: data.mensaje, errores: data.errores });
      } else {
        setFeedback({ tipo: 'ok', mensaje: data.mensaje, errores: [] });
        setCodigos([]);
      }
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Error al registrar ingreso';
      const errores = err.response?.data?.errores || [];
      setFeedback({ tipo: 'error', mensaje: msg, errores });
    }
  };

  return (
  <>
    <h2 style={styles.title}>🏢 Ingreso de Coolers</h2>

    {/* Bloques en paralelo */}
    <div style={styles.cardContainer}>
      {/* Bloque 1: Scanner + input manual */}
      <div style={styles.card}>
        {/* Scanner integrado */}
        <BarcodeScanner onDetected={agregarCodigo} />

        <div style={styles.formGroup}>
          <label style={styles.label}>Escriba código manualmente</label>
          <input
            style={styles.input}
            value={codigoInput}
            onChange={(e) => setCodigoInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ingrese código y presione Enter"
          />
        </div>
      </div>

      {/* Bloque 2: Lista de códigos */}
      <div style={styles.card}>
        <h3 style={styles.subtitle}>
          Coolers en este ingreso ({codigos.length}):
        </h3>
        <ul style={styles.list}>
          {codigos.map((c) => (
            <li key={c} style={styles.listItem}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FaCheckCircle color="#2e7d32" /> {c}
              </span>
              <button
                style={styles.deleteBtn}
                onClick={() => quitarCodigo(c)}
              >
                <FaTrash /> Quitar
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>

    {/* Acciones */}
    <div style={styles.card}>
      <div style={styles.actions}>
        <button
          style={puedeRegistrar ? styles.primaryBtn : styles.disabledBtn}
          onClick={registrarIngreso}
          disabled={!puedeRegistrar}
        >
          <FaCheckCircle /> Registrar ingreso
        </button>
        <button style={styles.dangerBtn} onClick={limpiarLista}>
          <FaTrash /> Limpiar lista
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div style={feedback.tipo === 'ok' ? styles.okBox : styles.errorBox}>
          <div style={styles.feedbackHeader}>
            {feedback.tipo === 'ok' && <FaCheckCircle color="#2e7d32" />}
            {feedback.tipo === 'error' && (
              <FaExclamationTriangle color="#c62828" />
            )}
            <strong style={{ marginLeft: 8 }}>{feedback.mensaje}</strong>
          </div>
          {feedback.errores.length > 0 && (
            <ul style={styles.feedbackList}>
              {feedback.errores.map((d, idx) => (
                <li key={idx} style={styles.feedbackItemErr}>
                  <span>
                    <strong>Código:</strong> {d.codigo}
                  </span>
                  <span>
                    <strong>Mensaje:</strong> {d.mensaje}
                  </span>
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

export default IngresoCooler;