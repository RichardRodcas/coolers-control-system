// src/LoginForm.jsx
import React, { useState } from 'react';
import { useAuth } from './AuthContext.jsx';

export default function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 360, margin: '20px auto' }}>
      <h3>Acceso</h3>
      <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required />
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Contraseña" required />
      <button type="submit">Entrar</button>
      {error && <div style={{ color: '#d32f2f', marginTop: 8 }}>{error}</div>}
    </form>
  );
}