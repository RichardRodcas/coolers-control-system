import React, { useState } from 'react';
import QrScanner from 'react-qr-barcode-scanner';

function BarcodeScanner({ onDetected }) {
  const [scanning, setScanning] = useState(false);

  // 🔊 Función para emitir sonido
  const playBeep = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1000, ctx.currentTime); // 1000 Hz
    oscillator.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.2); // dura 0.2 segundos
  };

  // 📳 Función para vibrar (solo móviles compatibles)
  const vibrate = () => {
    if (navigator.vibrate) {
      navigator.vibrate(200); // vibra 200 ms
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
      <button onClick={() => setScanning(!scanning)}>
        {scanning ? 'Detener escaneo' : 'Escanear código'}
      </button>

      {scanning && (
        <QrScanner
          delay={300}
          onError={(err) => console.error('[Scanner error]', err)}
          onScan={(data) => {
            if (data) {
              playBeep();   // 🔊 sonido
              vibrate();    // 📳 vibración
              onDetected(data);   // enviamos el código al padre
              setScanning(false); // cerramos el escaneo
            }
          }}
          style={{ width: '100%' }}
        />
      )}
    </div>
  );
}

export default BarcodeScanner;