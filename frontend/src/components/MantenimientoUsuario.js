import React, { useEffect, useContext, useMemo } from 'react';
import { styles } from '../styles/styles.js';
import "../styles/App.css";
import { CardContainer } from "./CardContainer.jsx";
import { Card } from "./Card.jsx";
import { AppContext } from '../context/AppContext.js';

export default function MantenimientoUsuario() {
  const { usuariosState, setUsuariosState } = useContext(AppContext);
  const { usuarios, error, mensaje } = usuariosState;

  const token = localStorage.getItem('token');

  // ✅ useMemo dentro del componente
  const authHeaders = useMemo(() => (
    token ? { "Authorization": `Bearer ${token}` } : {}
  ), [token]);

  useEffect(() => {
    const cargar = async () => {
      if (!token) {
        setUsuariosState(prev => ({ ...prev, error: "No hay token de autenticación. Inicia sesión." }));
        return;
      }
      try {
        const res = await fetch('https://192.168.0.95:5000/auth/usuarios', { headers: authHeaders });
        if (!res.headers.get('content-type')?.includes('application/json')) {
          throw new Error('El servidor no devolvió JSON');
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.mensaje || 'Error al cargar usuarios');
        setUsuariosState(prev => ({ ...prev, usuarios: data.data, error: '', mensaje: '' }));
      } catch (err) {
        setUsuariosState(prev => ({ ...prev, error: err.message, mensaje: '' }));
      }
    };
    if (usuarios.length === 0) cargar();
  }, [token, authHeaders, setUsuariosState, usuarios.length]);

  const eliminarUsuario = async (email) => {
    if (!token) {
      setUsuariosState(prev => ({ ...prev, error: "No hay token de autenticación. Inicia sesión." }));
      return;
    }
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;
    try {
      const res = await fetch(`https://192.168.0.95:5000/auth/usuarios/${email}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'Error al eliminar');

      setUsuariosState(prev => ({
        ...prev,
        usuarios: prev.usuarios.filter(u => u.email !== email),
        mensaje: data.mensaje,
        error: ''
      }));
    } catch (err) {
      setUsuariosState(prev => ({ ...prev, mensaje: '', error: err.message }));
    }
  };

  const actualizarUsuario = async (usuarioActualizado) => {
    if (!token) {
      setUsuariosState(prev => ({ ...prev, error: "No hay token de autenticación. Inicia sesión." }));
      return;
    }
    try {
      const payload = {
        name: usuarioActualizado.name,
        newEmail: usuarioActualizado.email,
        role: usuarioActualizado.role
      };

      const res = await fetch(`https://192.168.0.95:5000/auth/usuarios/${usuarioActualizado.email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'Error al actualizar');

      setUsuariosState(prev => ({
        ...prev,
        usuarios: prev.usuarios.map(u => (u.email === usuarioActualizado.email ? data.data : u)),
        mensaje: data.mensaje,
        error: ''
      }));
    } catch (err) {
      setUsuariosState(prev => ({ ...prev, mensaje: '', error: err.message }));
    }
  };

  return (
    <CardContainer>
      <Card>
        <h2 style={styles.title}>👥 Mantenimiento de Usuarios</h2>
        {error && <p className="errorMsg">{error}</p>}
        {mensaje && <p className="successMsg">{mensaje}</p>}

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#1976d2", color: "#fff" }}>
                <th style={{ padding: 8 }}>Nombre</th>
                <th style={{ padding: 8 }}>Correo</th>
                <th style={{ padding: 8 }}>Rol</th>
                <th style={{ padding: 8 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.email} style={{ borderBottom: "1px solid #ccc" }}>
                  <td style={{ padding: 8 }}>
                    <input
                      type="text"
                      value={u.name || ""}
                      onChange={(e) =>
                        setUsuariosState(prev => ({
                          ...prev,
                          usuarios: prev.usuarios.map(x =>
                            x.email === u.email ? { ...x, name: e.target.value } : x
                          )
                        }))
                      }
                      style={styles.input}
                    />
                  </td>

                  <td style={{ padding: 8 }}>{u.email}</td>

                  <td style={{ padding: 8 }}>
                    <select
                      value={u.role}
                      onChange={(e) =>
                        setUsuariosState(prev => ({
                          ...prev,
                          usuarios: prev.usuarios.map(x =>
                            x.email === u.email ? { ...x, role: e.target.value } : x
                          )
                        }))
                      }
                    >
                      <option value="operador_ingreso">Operador Ingreso</option>
                      <option value="operador_salida">Operador Salida</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </td>

                  <td style={{ padding: 8, display: "flex", gap: "8px" }}>
                    <button
                      style={styles.primaryBtn}
                      onClick={() => actualizarUsuario(u)}
                    >
                      💾 Guardar
                    </button>
                    <button
                      style={styles.secondaryBtn}
                      onClick={() => eliminarUsuario(u.email)}
                    >
                      ❌ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </CardContainer>
  );
}