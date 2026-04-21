import React, { useState } from 'react';
import InventarioEquipos from './InventarioEquipos';
import DetalleEquipo from './DetalleEquipo';
import IngresoEquipos from './IngresoEquipos';
import SalidaEquipos from './SalidaEquipos';
import MantenimientoEquipos from './MantenimientoEquipos';

function DashboardEquipos({ vista }) {
  const [codigoSeleccionado, setCodigoSeleccionado] = useState(null);

  const handleVerDetalle = (codigo) => {
    setCodigoSeleccionado(codigo);
  };

  const handleVolver = () => {
    setCodigoSeleccionado(null);
  };

  const renderVista = () => {
    if (codigoSeleccionado) {
      return <DetalleEquipo codigo={codigoSeleccionado} onVolver={handleVolver} />;
    }

    switch (vista) {
      case 'inventarioEquipos':
        return <InventarioEquipos onVerDetalle={handleVerDetalle} />;
      case 'ingresoEquipos':
        return <IngresoEquipos />;
      case 'salidaEquipos':
        return <SalidaEquipos />;
      case 'mantenimientoEquipos':
        return <MantenimientoEquipos />;
      default:
        return <InventarioEquipos onVerDetalle={handleVerDetalle} />;
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ color: '#1976d2' }}>⚙️ Dashboard de Equipos</h1>
      {renderVista()}
    </div>
  );
}

export default DashboardEquipos;
