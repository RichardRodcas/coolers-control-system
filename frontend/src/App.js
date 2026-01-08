import React, { useState } from 'react';
import IngresoCooler from './components/IngresoCooler';
import SalidaCooler from './components/SalidaCooler';
import Inventario from './components/Inventario';
import Trazabilidad from './components/Trazabilidad';
import MantenimientoCooler from './components/MantenimientoCooler';

function App() {
  const [activeView, setActiveView] = useState('inventario');

  return (
    <div>
      <h1>Control de Coolers</h1>

      {/* Menú principal */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveView('ingreso')} 
          style={{ backgroundColor: activeView === 'ingreso' ? '#4CAF50' : '#fff' }}
        >
          🔄 Ingreso
        </button>
        <button 
          onClick={() => setActiveView('salida')} 
          style={{ backgroundColor: activeView === 'salida' ? '#2196F3' : '#fff' }}
        >
          📤 Salida
        </button>
        <button 
          onClick={() => setActiveView('inventario')} 
          style={{ backgroundColor: activeView === 'inventario' ? '#ddd' : '#fff' }}
        >
          📦 Inventario
        </button>
        <button 
          onClick={() => setActiveView('trazabilidad')} 
          style={{ backgroundColor: activeView === 'trazabilidad' ? '#ddd' : '#fff' }}
        >
          🧾 Trazabilidad
        </button>
        <button 
          onClick={() => setActiveView('mantenimiento')} 
          style={{ backgroundColor: activeView === 'mantenimiento' ? '#ddd' : '#fff' }}
        >
          🛠️ Mantenimiento
        </button>
      </div>

      {/* Renderizado condicional */}
      {activeView === 'ingreso' && <IngresoCooler />}
      {activeView === 'salida' && <SalidaCooler />}
      {activeView === 'inventario' && <Inventario />}
      {activeView === 'trazabilidad' && <Trazabilidad />}
      {activeView === 'mantenimiento' && <MantenimientoCooler />}
    </div>
  );
}

export default App;