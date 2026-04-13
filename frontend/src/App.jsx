// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import "./styles/App.css";
import { AppProvider } from './context/AppContext.js';   // ✅ Importamos el contexto global

// Formularios de autenticación
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';

// Componentes del dashboard
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
// Wrapper para proteger vistas según login y rol
function Private({ roles = [], children }) {
  const { isAuthed, user } = useAuth();
  if (!isAuthed) return <Navigate to="/login" replace />;
  if (roles.length && !roles.includes(user?.role)) return <div>Acceso denegado</div>;
  return children;
}

// Layout del dashboard
function Dashboard() {
  const { user, logout } = useAuth();
  const [vista, setVista] = useState('inventario');

  const renderVista = () => {
    switch (vista) {
      case 'ingreso':
        return user?.role === 'operador_ingreso' || user?.role === 'admin'
          ? <IngresoCooler />
          : <div>Acceso denegado</div>;
      case 'salida':
        return user?.role === 'operador_salida' || user?.role === 'admin'
          ? <SalidaCooler />
          : <div>Acceso denegado</div>;
      case 'inventario':
        return <Inventario />;
      case 'trazabilidad':
        return <Trazabilidad />;
      case 'mantenimiento':
        return user?.role === 'admin' ? <MantenimientoCooler /> : <div>Acceso denegado</div>;
      case 'registroUsuario':
        return user?.role === 'admin' ? <RegisterForm /> : <div>Acceso denegado</div>;
      case 'registroClientes':
        return user?.role === 'admin' ? <RegistroClientes /> : <div>Acceso denegado</div>;
      case 'mantenimientoUsuario':
        return user?.role === 'admin' ? <MantenimientoUsuario /> : <div>Acceso denegado</div>;
      case 'buscarPorOT':
        return user?.role === 'admin' ? <BuscarPorOT userRole={user?.role} /> : <div>Acceso denegado</div>;
      case 'cambiarPassword':
        return <CambiarPassword />;
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
        {/* Zona izquierda vacía */}
        <div style={{ width: 150 }}></div>

        {/* Centro: logo + título */}
        <div style={{ textAlign: 'center', flexGrow: 1 }}>
          <img
            src="/logo-typsa.png"
            alt="Logo TYPSA"
            style={{ height: 70, marginBottom: 8 }}
          />
          <h1 style={{ color: '#1976d2', margin: 0 }}>⚙️ Control de Coolers TYPSA</h1>
        </div>

        {/* Derecha: usuario */}
        {user && (
          <div style={{ textAlign: 'right', width: 150 }}>
            <p style={{ margin: 0 }}>👤 {user.name} ({user.role})</p>
            <button onClick={logout} style={{ marginTop: 5 }}>Cerrar sesión</button>
          </div>
        )}
      </header>

      {/* Barra de navegación */}
      <nav style={{ marginTop: 12, textAlign: 'center', width: '225px', float: 'left' }}>
        <MenuPrincipal onNavigate={setVista} />
      </nav>

      {/* Contenido dinámico protegido */}
      <main style={{ padding: 20 }}>
        {renderVista()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>   {/* ✅ Envolvemos todo con AppProvider */}
        <Router>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />

            {/* Ruta protegida del dashboard */}
            <Route
              path="/dashboard"
              element={
                <Private roles={['admin','operador_ingreso','operador_salida']}>
                  <Dashboard />
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