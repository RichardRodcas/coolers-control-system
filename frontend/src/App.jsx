// src/App.jsx
import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import "./styles/App.css";
import { AppProvider, AppContext } from './context/AppContext.js';   // ✅ Contexto global

// Formularios de autenticación
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';

// Componentes del dashboard principal
import MenuPrincipal from './components/MenuPrincipal';
import Inventario from './components/Inventario';
import IngresoCooler from './components/IngresoCooler';
import SalidaCooler from './components/SalidaCooler';
import MantenimientoCooler from './components/MantenimientoCooler';
import Trazabilidad from './components/Trazabilidad';
import MantenimientoUsuario from './components/MantenimientoUsuario';
import RegistroClientes from './components/RegistroClientes';
import BuscarPorOT  from './components/BuscarPorOT';
import CambiarPassword from './components/CambiarPassword';
import RecepcionMuestras from './components/RecepcionMuestras';
import Indicadores from './components/Indicadores';
import ForgotPassword from './components/auth/ForgotPassword.jsx';
import ResetRequestsAdmin from './components/ResetRequestsAdmin.jsx'; // ✅ corregido
import HistorialCoolers from './components/HistorialCoolers.jsx';

// Dashboard específico de equipos
import DashboardEquipos from './components/equipos/DashboardEquipos.jsx';

// Wrapper para proteger vistas según login y rol
function Private({ roles = [], children }) {
  const { isAuthed, user, loading } = useAuth();

  if (loading) return <div>Cargando sesión...</div>;
  if (!isAuthed) return <Navigate to="/login" replace />;
  if (roles.length && !roles.includes(user?.role)) return <div>Acceso denegado</div>;

  return children;
}

// Layout del dashboard principal (Coolers, trazabilidad, etc.)
function Dashboard() {
  console.log("[Dashboard] Renderizando Dashboard");
  const { user, logout } = useAuth();
  const [vista, setVista] = useState('inventario');
  const { openTrazabilidad, setOpenTrazabilidad } = useContext(AppContext);

  useEffect(() => {
    if (openTrazabilidad) {
      setVista('trazabilidad');
      setOpenTrazabilidad(false);
    }
  }, [openTrazabilidad, setOpenTrazabilidad]);

  const renderVista = () => {
    switch (vista) {
      case 'ingreso':
        return user?.role === 'operador_ingreso' || user?.role === 'admin'
          ? <IngresoCooler /> : <div>Acceso denegado</div>;
      case 'recepcionMuestras':
        return user?.role === 'recepcion_muestras' || user?.role === 'admin'
          ? <RecepcionMuestras /> : <div>Acceso denegado</div>;
      case 'salida':
        return user?.role === 'operador_salida' || user?.role === 'admin'
          ? <SalidaCooler /> : <div>Acceso denegado</div>;
      case 'inventario':
        return <Inventario />;
      case 'trazabilidad':
        return <Trazabilidad />;
      case 'historialCoolers':
        return <HistorialCoolers />;
      case 'mantenimiento':
        return user?.role === 'admin' || user?.role === 'operador_salida'
          ? <MantenimientoCooler /> : <div>Acceso denegado</div>;
      case 'registroUsuario':
        return user?.role === 'admin' ? <RegisterForm /> : <div>Acceso denegado</div>;
      case 'registroClientes':
        return user?.role === 'admin' || user?.role === 'operador_salida'
          ? <RegistroClientes /> : <div>Acceso denegado</div>;
      case 'mantenimientoUsuario':
        return user?.role === 'admin' ? <MantenimientoUsuario /> : <div>Acceso denegado</div>;
      case 'buscarPorOT':
        return user?.role === 'admin' || user?.role === 'operador_salida'
          ? <BuscarPorOT userRole={user?.role} /> : <div>Acceso denegado</div>;
      case 'cambiarPassword':
        return <CambiarPassword />;
      case 'indicadores':
        return user?.role === 'admin' ? <Indicadores /> : <div>Acceso denegado</div>;
      case 'inventarioEquipos':
        return <DashboardEquipos vista="inventarioEquipos" />;
      case 'salidaEquipos':
        return <DashboardEquipos vista="salidaEquipos" />;
      case 'mantenimientoEquipos':
        return <DashboardEquipos vista="mantenimientoEquipos" />;
      case 'ingresoEquipos':
        return <DashboardEquipos vista="ingresoEquipos" />;
      case 'resetRequestsAdmin': // ✅ nuevo caso
        return user?.role === 'admin' ? <ResetRequestsAdmin /> : <div>Acceso denegado</div>;
      default:
        return <Inventario />;
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      {/* Header fijo */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ width: 150 }}></div>
        <div style={{ textAlign: 'center', flexGrow: 1 }}>
          <img
            src="/logo-typsa.png"
            alt="Logo TYPSA"
            style={{ height: 70, marginBottom: 8 }}
          />
          <h1 style={{ color: '#1976d2', margin: 0 }}>⚙️ Control de Coolers TYPSA</h1>
        </div>
        {user && (
          <div style={{ textAlign: 'right', width: 150 }}>
            <p style={{ margin: 0 }}>👤 {user.name} ({user.role})</p>
            <button onClick={logout} style={{ marginTop: 5 }}>Cerrar sesión</button>
          </div>
        )}
      </header>

      {/* Menú lateral + contenido dinámico */}
      <MenuPrincipal onNavigate={setVista} vista={vista}>
        {renderVista()}
      </MenuPrincipal>
    </div>
  );
}

// App principal con rutas
export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/forgot" element={<ForgotPassword />} />

            {/* Ruta protegida del dashboard principal */}
            <Route
              path="/dashboard"
              element={
                <Private roles={['admin','operador_ingreso','operador_salida','recepcion_muestras']}>
                  <Dashboard />
                </Private>
              }
            />

            {/* Ruta protegida del dashboard de equipos */}
            <Route
              path="/dashboard/equipos"
              element={
                <Private roles={['admin','operador_equipos']}>
                  <DashboardEquipos vista="inventarioEquipos" />
                </Private>
              }
            />

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}
