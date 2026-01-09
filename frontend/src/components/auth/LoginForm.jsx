// src/components/auth/LoginForm.jsx
import React, { useState } from 'react';
import { styles } from '../../styles/styles';
import { useAuth } from '../../AuthContext'; // 👈 usamos el contexto
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const { login } = useAuth(); // 👈 obtenemos la función login del contexto
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password); // 👈 login desde el contexto
      navigate('/dashboard'); // 👈 redirige al dashboard
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>🔐 Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} style={styles.formColumn}>
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

        <button type="submit" style={styles.primaryBtn}>Entrar</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}