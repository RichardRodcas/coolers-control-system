// src/components/MantenimientoUsuario.jsx
import React, { useState, useEffect } from 'react';
import { styles } from '../styles/styles';

export default function MantenimientoUsuario() {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const token = localStorage.getItem('token');

  // ✅ Helper para headers con token
  const authHeaders = token
    ? { "Authorization": `Bearer ${token}` }
    : {};

  // ✅ Cargar usuarios al montar
  useEffect(() => {
    const cargar = async () => {
      if (!token) {
        setError("No hay token de autenticación. Inicia sesión.");
        return;
      }
      try {
        const res = await fetch('http://localhost:5000/auth/usuarios', {
          headers: authHeaders
        });
        if (!res.headers.get('content-type')?.includes('application/json')) {
          throw new Error('El servidor no devolvió JSON');
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.mensaje || 'Error al cargar usuarios');
        setUsuarios(data.data);
      } catch (err) {
        setError(err.message);
      }
    };
    cargar();
  }, [token]);

  // ✅ Eliminar usuario
  const eliminarUsuario = async (id) => {
    if (!token) {
      setError("No hay token de autenticación. Inicia sesión.");
      return;
    }
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;
    try {
      const res = await fetch(`http://localhost:5000/auth/usuarios/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (!res.headers.get('content-type')?.includes('application/json')) {
        throw new Error('El servidor no devolvió JSON');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'Error al eliminar');

      setUsuarios(prev => prev.filter(u => u.id !== id));
      setMensaje(data.mensaje);
      setError('');
    } catch (err) {
      setMensaje('');
      setError(err.message);
    }
  };

  // ✅ Actualizar usuario (ejemplo: cambiar rol)
  const actualizarUsuario = async (usuarioActualizado) => {
    if (!token) {
      setError("No hay token de autenticación. Inicia sesión.");
      return;
    }
    try {
      // 👇 Transformamos "nombre" a "name" para que coincida con el backend
      const payload = {
        id: usuarioActualizado.id,
        name: usuarioActualizado.nombre,
        email: usuarioActualizado.email,
        role: usuarioActualizado.role
      };

      const res = await fetch(`http://localhost:5000/auth/usuarios/${usuarioActualizado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(payload)
      });
      if (!res.headers.get('content-type')?.includes('application/json')) {
        throw new Error('El servidor no devolvió JSON');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'Error al actualizar');

      setUsuarios(prev =>
        prev.map(u => (u.id === usuarioActualizado.id ? data.data : u))
      );
      setMensaje(data.mensaje);
      setError('');
    } catch (err) {
      setMensaje('');
      setError(err.message);
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>👥 Mantenimiento de Usuarios</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#1976d2', color: '#fff' }}>
            <th style={{ padding: 8 }}>Nombre</th>
            <th style={{ padding: 8 }}>Correo</th>
            <th style={{ padding: 8 }}>Rol</th>
            <th style={{ padding: 8 }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(u => (
            <tr key={u.email} style={{ borderBottom: '1px solid #ccc' }}>
              <td style={{ padding: 8 }}>{u.nombre}</td>
              <td style={{ padding: 8 }}>{u.email}</td>
              <td style={{ padding: 8 }}>
                <select
                  value={u.role}
                  onChange={(e) =>
                    actualizarUsuario({
                      email: u.email,
                      nombre: u.nombre,   // 👈 se transforma a "name" dentro de actualizarUsuario
                      role: e.target.value
                    })
                  }
                >
                  <option value="operador_ingreso">Operador Ingreso</option>
                  <option value="operador_salida">Operador Salida</option>
                  <option value="admin">Administrador</option>
                </select>
              </td>
              <td style={{ padding: 8 }}>
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
  );
}