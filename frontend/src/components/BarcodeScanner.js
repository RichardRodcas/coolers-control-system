import React, { useState, useRef } from 'react';
import QrScanner from 'react-qr-barcode-scanner';
import { validateCode } from '../api.js'; // 👈 usamos la función del api.js
import { styles } from '../styles/styles.js';

function BarcodeScanner({ onDetected }) {
  const [scanning, setScanning] = useState(false);
  const [lastCode, setLastCode] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const audioCtxRef = useRef(null);

  const playBeep = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const oscillator = audioCtxRef.current.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1000, audioCtxRef.current.currentTime);
    oscillator.connect(audioCtxRef.current.destination);
    oscillator.start();
    oscillator.stop(audioCtxRef.current.currentTime + 0.2);
  };

  const vibrate = () => {
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
  };

  const handleScan = async (data) => {
    if (data) {
      const code = data.text || data;
      if (lastCode === code) return; // evita validar el mismo código repetidamente

      playBeep();
      vibrate();
      setLastCode(code);

      try {
        const result = await validateCode(code);
        if (result) {
          onDetected(result);
        }
      } catch (err) {
        setErrorMsg(err.message || 'Error validando código');
      }
    }
  };

  return (
    <div style={{ ...styles.card, maxWidth: 400 }}>
      <button
        aria-label="Toggle scanner"
        style={styles.primaryBtn}
        onClick={() => setScanning(!scanning)}
      >
        {scanning ? 'Detener escaneo' : 'Escanear código'}
      </button>

      {scanning && (
        <QrScanner
          delay={300}
          onError={(err) => {
            console.error('[Scanner error]', err);
            setErrorMsg('Error al acceder a la cámara');
          }}
          onScan={handleScan}
          style={{ width: '100%' }}
        />
      )}

      {lastCode && <p role="status" style={{ color: '#1976d2' }}>Último código: {lastCode}</p>}
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
    </div>
  );
}

export default BarcodeScanner;