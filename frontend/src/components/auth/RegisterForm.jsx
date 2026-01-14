// src/components/auth/RegisterForm.jsx
import React, { useState } from 'react';
import { styles } from '../../styles/styles';

export default function RegisterForm({ onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'operador_ingreso' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('http://localhost:4000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en el registro');

      setSuccess('Usuario registrado correctamente ✅');

      // resetear formulario
      setForm({ name: '', email: '', password: '', role: 'operador_ingreso' });

      // ❌ Eliminado el login automático
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error en registro:", err);
      setError(err.message);
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>📝 Registro de Usuario</h2>
      <form onSubmit={handleSubmit} style={styles.formColumn}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Nombre completo</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Correo electrónico</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Contraseña</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Rol</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="operador_ingreso">Operador Ingreso</option>
            <option value="operador_salida">Operador Salida</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        {/* ✅ Botón para ejecutar la función */}
        <button type="submit" style={styles.primaryBtn}>Registrar</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
}