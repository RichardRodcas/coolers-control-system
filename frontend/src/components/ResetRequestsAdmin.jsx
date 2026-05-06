import React from 'react';
import { styles } from '../styles/styles.js';
import { useAuth } from '../AuthContext.jsx';
import "../styles/App.css";

function MenuPrincipal({ onNavigate, children }) {
  const { isAuthed, user } = useAuth();

  console.log("[MenuPrincipal] isAuthed:", isAuthed, "user:", user);

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
              🏢 Vigilancia
            </button>
          )}

          {(user?.role === 'operador_salida' || user?.role === 'admin') && (
            <button
              style={{ ...styles.navBtn, ...styles.btnSalida }}
              onClick={() => handleNavigate('salida')}
            >
              🚚 Preparación de Materiales
            </button>
          )}

          {(user?.role === 'recepcion_muestras' || user?.role === 'admin') && (
            <button
              style={{ ...styles.navBtn, backgroundColor: "#6a1b9a", color: "#fff" }}
              onClick={() => handleNavigate('recepcionMuestras')}
            >
              🧪 Recepción de Muestras
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
                📋 Buscar por SS
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
                style={{ ...styles.navBtn, backgroundColor: "#009688", color: "#fff" }}
                onClick={() => handleNavigate('indicadores')}
              >
                📊 Indicadores
              </button>

              <button
                style={{ ...styles.navBtn, ...styles.btnRegistro }}
                onClick={() => handleNavigate('registroUsuario')}
              >
                📝 Registro de Usuario
              </button>

              <button
                style={{ ...styles.navBtn, ...styles.btnMantenimiento }}
                onClick={() => handleNavigate('mantenimientoUsuario')}
              >
                👥 Mantenimiento Usuario
              </button>

              {/* Botones para equipos */}
              {['admin','operador_equipos'].includes(user?.role) && (
                <div style={{ marginTop: 20 }}>
                  <h3 style={{ color: "#4caf50" }}>⚙️ Control de Equipos</h3>
                  <button
                    style={{ ...styles.navBtn, backgroundColor: "#4caf50", color: "#fff" }}
                    onClick={() => handleNavigate('ingresoEquipos')}
                  >
                    ➕ Ingreso de Equipos
                  </button>
                  <button
                    style={{ ...styles.navBtn, backgroundColor: "#ff5722", color: "#fff" }}
                    onClick={() => handleNavigate('salidaEquipos')}
                  >
                    🚚 Salida de Equipos
                  </button>
                  <button
                    style={{ ...styles.navBtn, backgroundColor: "#2196f3", color: "#fff" }}
                    onClick={() => handleNavigate('inventarioEquipos')}
                  >
                    📦 Inventario de Equipos
                  </button>
                  <button
                    style={{ ...styles.navBtn, backgroundColor: "#9c27b0", color: "#fff" }}
                    onClick={() => handleNavigate('mantenimientoEquipos')}
                  >
                    🛠️ Mantenimiento de Equipos
                  </button>
                </div>
              )}

              {/* Nuevo botón para ResetRequestsAdmin */}
              <button
                style={{ ...styles.navBtn, backgroundColor: "#e91e63", color: "#fff", marginTop: 20 }}
                onClick={() => handleNavigate('resetRequestsAdmin')}
              >
                ❓ Reset de Contraseñas
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
