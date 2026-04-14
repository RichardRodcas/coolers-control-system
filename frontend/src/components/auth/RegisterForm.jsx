// src/components/auth/RegisterForm.jsx
import React, { useState } from 'react';
import { styles } from '../../styles/styles.js';
import "../../styles/App.css";
import { CardContainer } from "../CardContainer.jsx";
import { Card } from "../Card.jsx";

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
      const res = await fetch('https://192.168.0.95:4000/auth/register', {
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
  <CardContainer>
    <Card>
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
            required
          >
            <option value="">Seleccione un rol</option>
            <option value="operador_ingreso">Operador Ingreso</option>
            <option value="operador_salida">Operador Salida</option>
            <option value="recepcion_muestras">Recepción de Muestras</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <button type="submit" style={styles.primaryBtn}>Registrar</button>
      </form>

      {error && <p className="errorMsg">{error}</p>}
      {success && <p className="successMsg">{success}</p>}
    </Card>
  </CardContainer>
);
}