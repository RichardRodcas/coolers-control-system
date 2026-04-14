// src/components/RecepcionMuestras.jsx
import React, { useState, useContext } from 'react';
import { recepcionCoolers } from '../api.js';
import { FaCheckCircle, FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import { styles } from '../styles/styles.js';
import "../styles/App.css";
import { CardContainer } from "./CardContainer.jsx";
import { Card } from "./Card.jsx";
import { AppContext } from '../context/AppContext.js';

function RecepcionMuestras() {
  const { recepcion, setRecepcion } = useContext(AppContext);
  const [codigoInput, setCodigoInput] = useState('');

  const agregarCodigo = (codigo) => {
    const limpio = (codigo || '').trim();
    if (limpio && !recepcion.codigos.includes(limpio)) {
      setRecepcion(prev => ({ ...prev, codigos: [...prev.codigos, limpio] }));
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
    setRecepcion(prev => ({ ...prev, codigos: prev.codigos.filter(c => c !== codigo) }));
  };

  const limpiarLista = () => {
    if (recepcion.codigos.length === 0) return;
    if (window.confirm(`¿Seguro que quieres borrar los ${recepcion.codigos.length} códigos?`)) {
      setRecepcion({ codigos: [], feedback: null });
      setCodigoInput('');
    }
  };

  const puedeRegistrar = recepcion.codigos.length > 0;

  const registrarRecepcion = async () => {
    setRecepcion(prev => ({ ...prev, feedback: null }));

    if (recepcion.codigos.length === 0) {
      setRecepcion(prev => ({
        ...prev,
        feedback: { tipo: 'error', mensaje: 'Debes ingresar al menos un código', errores: [] }
      }));
      return;
    }

    try {
      const data = await recepcionCoolers(recepcion.codigos);

      if (data.errores && data.errores.length > 0) {
        setRecepcion(prev => ({
          ...prev,
          feedback: { tipo: 'error', mensaje: data.mensaje, errores: data.errores }
        }));
      } else {
        setRecepcion({ codigos: [], feedback: { tipo: 'ok', mensaje: data.mensaje, errores: [] } });
      }
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Error al registrar recepción';
      const errores = err.response?.data?.errores || [];
      setRecepcion(prev => ({
        ...prev,
        feedback: { tipo: 'error', mensaje: msg, errores }
      }));
    }
  };

  return (
    <>
      <h2 style={styles.title}>🧪 Recepción de Muestras</h2>

      <CardContainer>
        <Card>
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
        </Card>

        <Card>
          <h3 style={styles.subtitle}>
            Coolers en recepción ({recepcion.codigos.length}):
          </h3>
          <ul style={styles.list}>
            {recepcion.codigos.map((c) => (
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
        </Card>
      </CardContainer>

      <Card>
        <div style={styles.actions}>
          <button
            style={puedeRegistrar ? styles.primaryBtn : styles.disabledBtn}
            onClick={registrarRecepcion}
            disabled={!puedeRegistrar}
          >
            <FaCheckCircle /> Registrar recepción
          </button>
          <button style={styles.dangerBtn} onClick={limpiarLista}>
            <FaTrash /> Limpiar lista
          </button>
        </div>

        {recepcion.feedback && (
          <div className={recepcion.feedback.tipo === 'ok' ? "okBox" : "errorBox"}>
            <div className="feedbackHeader">
              {recepcion.feedback.tipo === 'ok' && <FaCheckCircle color="#2e7d32" />}
              {recepcion.feedback.tipo === 'error' && (
                <FaExclamationTriangle color="#c62828" />
              )}
              <strong style={{ marginLeft: 8 }}>{recepcion.feedback.mensaje}</strong>
            </div>
            {recepcion.feedback?.errores?.length > 0 && (
              <ul className="feedbackList">
                {recepcion.feedback.errores.map((d, idx) => (
                  <li key={idx} className="feedbackItemErr">
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

export default RecepcionMuestras;