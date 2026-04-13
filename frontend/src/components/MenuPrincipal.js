import React from 'react';
import { styles } from '../styles/styles.js';
import { useAuth } from '../AuthContext.jsx';
import "../styles/App.css";

function MenuPrincipal({ onNavigate, children }) {
  const { isAuthed, user } = useAuth();
  const userName = isAuthed ? user?.name : 'Invitado';

  const handleNavigate = (vista) => {
    if (typeof onNavigate === 'function') {
      onNavigate(vista);
    } else {
      console.log(`Navegación a ${vista} (sin handler)`);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar lateral */}
      <aside
        style={{
          width: 220,
          backgroundColor: '#f5f5f5',
          padding: 16,
          borderRight: '1px solid #ddd',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h3 style={{ marginBottom: 24, color: '#1976d2' }}>
          Bienvenido, {userName} {isAuthed && `(${user?.role})`}
        </h3>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(user?.role === 'operador_ingreso' || user?.role === 'admin') && (
            <button
              style={{ ...styles.navBtn, ...styles.btnIngreso }}
              onClick={() => handleNavigate('ingreso')}
            >
              🏢 Ingreso
            </button>
          )}

          {(user?.role === 'operador_salida' || user?.role === 'admin') && (
            <button
              style={{ ...styles.navBtn, ...styles.btnSalida }}
              onClick={() => handleNavigate('salida')}
            >
              🚚 Salida
            </button>
          )}

          <button
            style={{ ...styles.navBtn, ...styles.btnInventario }}
            onClick={() => handleNavigate('inventario')}
          >
            📦 Inventario
          </button>

          <button
            style={{ ...styles.navBtn, ...styles.btnTrazabilidad }}
            onClick={() => handleNavigate('trazabilidad')}
          >
            🔎 Trazabilidad
          </button>

          {/* Bloque compartido entre admin y operador_salida */}
          {['admin','operador_salida'].includes(user?.role) && (
            <>
              <button
                style={{ ...styles.navBtn, ...styles.btnBuscarOT }}
                onClick={() => handleNavigate('buscarPorOT')}
              >
                📋 Buscar por OT
              </button>

              <button
                style={{ ...styles.navBtn, ...styles.btnMantenimiento }}
                onClick={() => handleNavigate('mantenimiento')}
              >
                🛠️ Mantenimiento Coolers
              </button>

              <button
                style={{ ...styles.navBtn, ...styles.btnClientes }}
                onClick={() => handleNavigate('registroClientes')}
              >
                👤 Clientes
              </button>
            </>
          )}

          {/* Bloque exclusivo de admin */}
          {user?.role === 'admin' && (
            <>
              <button
                style={{ ...styles.navBtn, ...styles.btnRegistro }}
                onClick={() => handleNavigate('registroUsuario')}
              >
                📝 Registro Usuario
              </button>

              <button
                style={{ ...styles.navBtn, ...styles.btnMantenimiento }}
                onClick={() => handleNavigate('mantenimientoUsuario')}
              >
                👥 Mantenimiento Usuario
              </button>
            </>
          )}

          {isAuthed && (
            <button
              style={{ ...styles.navBtn, backgroundColor: "#ff9800", color: "#fff" }}
              onClick={() => handleNavigate("cambiarPassword")}
            >
              🔑 Cambiar Contraseña
            </button>
          )}
        </nav>
      </aside>

      {/* Contenido principal */}
      <main style={{ flex: 1, padding: 24 }}>
        {children}
      </main>
    </div>
  );
}

export default MenuPrincipal;