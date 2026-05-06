// src/components/auth/LoginForm.jsx
import React, { useState } from 'react';
import { styles } from '../../styles/styles.js';
import { useAuth } from '../../AuthContext.jsx'; // 👈 usamos el contexto
import { useNavigate } from 'react-router-dom';
import "../../styles/App.css";
import { CardContainer } from "../CardContainer.jsx";
import { Card } from "../Card.jsx";
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function LoginForm() {
  const { login } = useAuth(); // 👈 obtenemos la función login del contexto
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
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
  <CardContainer>
    <Card>
      <h2 style={styles.title}>🔐 Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} style={styles.formColumn}>
        <div className="form-group">
  <label>Correo electrónico</label>
  <div className="input-wrapper">
    <input
      type="email"
      name="email"
      value={form.email}
      onChange={handleChange}
      required
      className="text-input"
    />
  </div>
</div>

        <div style={styles.formGroup}>
  <label style={styles.label}>Contraseña</label>
  <div className="password-wrapper">
    <input
      type={showPassword ? "text" : "password"}
      name="password"
      value={form.password}
      onChange={handleChange}
      required
      className="password-input"
    />
    <span
      onClick={() => setShowPassword(!showPassword)}
      className="toggle-eye"
    >
      {showPassword ? <FaEyeSlash /> : <FaEye />}
    </span>
  </div>
</div>


        <button type="submit" style={styles.primaryBtn}>Entrar</button>
        <p>
        <a href="/forgot">¿Olvidaste tu contraseña?</a>
        </p>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </Card>
  </CardContainer>
);

}