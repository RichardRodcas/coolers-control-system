import React, { useState } from 'react';
import api from '../api';
import { FaCheckCircle, FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import { styles } from './styles';

function SalidaCooler() {
  const [codigos, setCodigos] = useState([]);
  const [codigoInput, setCodigoInput] = useState('');
  const [cliente, setCliente] = useState('');
  const [ordenTrabajo, setOrdenTrabajo] = useState('');
  const [feedback, setFeedback] = useState(null); // { tipo: 'ok'|'error', mensaje, errores: [] }

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
    if (window.confirm(`¿Seguro que quieres borrar los ${codigos.length} códigos?`)) {
      setCodigos([]);
      setCodigoInput('');
    }
  };

  const puedeRegistrar = cliente.trim() && ordenTrabajo.trim() && codigos.length > 0;

  const registrarSalida = async () => {
    setFeedback(null);

    if (!cliente.trim() || !ordenTrabajo.trim()) {
      setFeedback({
        tipo: 'error',
        mensaje: 'Cliente y orden de trabajo son obligatorios',
        errores: []
      });
      return;
    }
    if (codigos.length === 0) {
      setFeedback({
        tipo: 'error',
        mensaje: 'Debes ingresar al menos un código',
        errores: []
      });
      return;
    }

    try {
      const { data } = await api.post('/coolers/salida', { codigos, cliente, ordenTrabajo });

      // Si el backend devuelve errores, mostramos cuadro rojo
      if (data.errores && data.errores.length > 0) {
        setFeedback({
          tipo: 'error',
          mensaje: data.mensaje,
          errores: data.errores
        });
      } else {
        setFeedback({
          tipo: 'ok',
          mensaje: data.mensaje,
          errores: []
        });
        setCodigos([]); // limpiar lista solo si todo salió bien
      }

    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Error al registrar salida';
      const errores = err.response?.data?.errores || [];
      setFeedback({
        tipo: 'error',
        mensaje: msg,
        errores
      });
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>🚚 Salida de Coolers</h2>

      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Cliente</label>
          <input style={styles.input} value={cliente} onChange={(e) => setCliente(e.target.value)} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Orden de trabajo</label>
          <input style={styles.input} value={ordenTrabajo} onChange={(e) => setOrdenTrabajo(e.target.value)} />
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Escanee o escriba código</label>
        <input
          style={styles.input}
          value={codigoInput}
          onChange={(e) => setCodigoInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </div>

      <h3 style={styles.subtitle}>Coolers en esta salida ({codigos.length}):</h3>
      <ul style={styles.list}>
        {codigos.map(c => (
          <li key={c} style={styles.listItem}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FaCheckCircle color="#2e7d32" /> {c}
            </span>
            <button style={styles.deleteBtn} onClick={() => quitarCodigo(c)}>
              <FaTrash /> Quitar
            </button>
          </li>
        ))}
      </ul>

      <div style={styles.actions}>
        <button
          style={puedeRegistrar ? styles.primaryBtn : styles.disabledBtn}
          onClick={registrarSalida}
          disabled={!puedeRegistrar}
        >
          Registrar salida
        </button>
        <button style={styles.dangerBtn} onClick={limpiarLista}>
          Limpiar lista
        </button>
      </div>

      {/* Feedback block */}
      {feedback && (
        <div
          style={feedback.tipo === 'ok' ? styles.okBox : styles.errorBox}
        >
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
  );
}



export default SalidaCooler;