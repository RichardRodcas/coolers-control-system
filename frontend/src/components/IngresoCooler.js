// src/components/IngresoCooler.jsx
import React, { useState, useContext } from 'react';
import { ingresoCoolers } from '../api.js';
import { FaCheckCircle, FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import { styles } from '../styles/styles.js';
//import BarcodeScanner from './BarcodeScanner.js';
import "../styles/App.css";
import { CardContainer } from "./CardContainer.jsx";
import { Card } from "./Card.jsx";
import { AppContext } from '../context/AppContext.js';   // ✅ Importamos el contexto

function IngresoCooler() {
  const { ingreso, setIngreso } = useContext(AppContext); // ✅ Estado global
  const [codigoInput, setCodigoInput] = useState('');

  const agregarCodigo = (codigo) => {
    const limpio = (codigo || '').trim();
    if (limpio && !ingreso.codigos.includes(limpio)) {
      setIngreso(prev => ({ ...prev, codigos: [...prev.codigos, limpio] }));
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
    setIngreso(prev => ({ ...prev, codigos: prev.codigos.filter(c => c !== codigo) }));
  };

  const limpiarLista = () => {
    if (ingreso.codigos.length === 0) return;
    if (window.confirm(`¿Seguro que quieres borrar los ${ingreso.codigos.length} códigos?`)) {
      setIngreso({ codigos: [], feedback: null });
      setCodigoInput('');
    }
  };

  const puedeRegistrar = ingreso.codigos.length > 0;

  const registrarIngreso = async () => {
    setIngreso(prev => ({ ...prev, feedback: null }));

    if (ingreso.codigos.length === 0) {
      setIngreso(prev => ({ ...prev, feedback: { tipo: 'error', mensaje: 'Debes ingresar al menos un código', errores: [] } }));
      return;
    }

    try {
      const data = await ingresoCoolers(ingreso.codigos); // ✅ sin token

      if (data.errores && data.errores.length > 0) {
        setIngreso(prev => ({ ...prev, feedback: { tipo: 'error', mensaje: data.mensaje, errores: data.errores } }));
      } else {
        setIngreso({ codigos: [], feedback: { tipo: 'ok', mensaje: data.mensaje, errores: [] } });
      }
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Error al registrar ingreso';
      const errores = err.response?.data?.errores || [];
      setIngreso(prev => ({ ...prev, feedback: { tipo: 'error', mensaje: msg, errores } }));
    }
  };

  return (
    <>
      <h2 style={styles.title}>🏢 Ingreso de Coolers</h2>

      {/* Bloques en paralelo */}
      <CardContainer>
        {/* Bloque 1: Scanner + input manual */}
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

        {/* Bloque 2: Lista de códigos */}
        <Card>
          <h3 style={styles.subtitle}>
            Coolers en este ingreso ({ingreso.codigos.length}):
          </h3>
          <ul style={styles.list}>
            {ingreso.codigos.map((c) => (
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

      {/* Acciones */}
      <Card>
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
        {ingreso.feedback && (
          <div className={ingreso.feedback.tipo === 'ok' ? "okBox" : "errorBox"}>
            <div className="feedbackHeader">
              {ingreso.feedback.tipo === 'ok' && <FaCheckCircle color="#2e7d32" />}
              {ingreso.feedback.tipo === 'error' && (
                <FaExclamationTriangle color="#c62828" />
              )}
              <strong style={{ marginLeft: 8 }}>{ingreso.feedback.mensaje}</strong>
            </div>
            {ingreso.feedback.errores.length > 0 && (
              <ul className="feedbackList">
                {ingreso.feedback.errores.map((d, idx) => (
                  <li key={idx} className="feedbackItemErr">
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
      </Card>
    </>
  );
}

export default IngresoCooler;