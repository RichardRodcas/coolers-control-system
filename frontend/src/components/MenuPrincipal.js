import React from 'react';
import { styles } from '../styles/styles';
import { useAuth } from '../AuthContext';

function MenuPrincipal({ onNavigate }) {
  const { isAuthed, user, logout } = useAuth();

  const userName = isAuthed ? user?.name : 'Invitado';
  const puedeOperar = user?.role === 'operador' || user?.role === 'admin';

  const handleNavigate = (vista) => {
    if (typeof onNavigate === 'function') {
      onNavigate(vista);
    } else {
      console.log(`Navegación a ${vista} (sin handler)`);
    }
  };

  return (
    <div style={styles.card}>
      {/* Barra superior con saludo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, color: '#1976d2' }}>
          Bienvenido, {userName} {isAuthed && `(${user?.role})`}
        </h3>
        
      </div>

      {/* Barra de navegación */}
      <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
        {puedeOperar && (
          <button
            style={{ ...styles.navBtn, ...styles.btnIngreso }}
            onClick={() => handleNavigate('ingreso')}
            aria-label="Ingreso de coolers"
          >
            🏢 Ingreso
          </button>
        )}

        {puedeOperar && (
          <button
            style={{ ...styles.navBtn, ...styles.btnSalida }}
            onClick={() => handleNavigate('salida')}
            aria-label="Salida de coolers"
          >
            🚚 Salida
          </button>
        )}

        <button
          style={{ ...styles.navBtn, ...styles.btnInventario }}
          onClick={() => handleNavigate('inventario')}
          aria-label="Inventario general"
        >
          📦 Inventario
        </button>

        <button
          style={{ ...styles.navBtn, ...styles.btnTrazabilidad }}
          onClick={() => handleNavigate('trazabilidad')}
          aria-label="Trazabilidad de coolers"
        >
          🔎 Trazabilidad
        </button>

        {user?.role === 'admin' && (
          <button
            style={{ ...styles.navBtn, ...styles.btnMantenimiento }}
            onClick={() => handleNavigate('mantenimiento')}
            aria-label="Mantenimiento de coolers"
          >
            🛠️ Mantenimiento
          </button>
        )}

        {user?.role === 'admin' && (
          <button
            style={{ ...styles.navBtn, ...styles.btnRegistro }}
            onClick={() => handleNavigate('registroUsuario')}
            aria-label="Registro de usuarios"
          >
            📝 Registro Usuario
          </button>
        )}
        {user?.role === 'admin' && (
  <button
    style={{ ...styles.navBtn, ...styles.btnMantenimiento }}
    onClick={() => handleNavigate('mantenimientoUsuario')}
  >
    👥 Mantenimiento Usuario
  </button>
)}  
      </nav>
    </div>
  );
}

export default MenuPrincipal;