import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { styles } from "../styles/styles";

const RegistroClientes = () => {
  const { user, isAuthed } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ ruc: "", razon_social: "", email: "", telefono: "", direccion: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const authHeaders = token ? { "Authorization": `Bearer ${token}` } : {};

  useEffect(() => {
    const cargar = async () => {
      if (!token) {
        setError("No hay token de autenticación. Inicia sesión.");
        return;
      }
      try {
        const res = await fetch("http://localhost:5000/clientes", {
          headers: authHeaders,
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.mensaje || "Error cargando clientes");
        setClientes(data.data);
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    };
    if (isAuthed && user?.role === "admin") cargar();
  }, [isAuthed, user, token]);

  if (!isAuthed || user?.role !== "admin") {
    return <p>No tienes permisos para acceder a este módulo.</p>;
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEditing ? `http://localhost:5000/clientes/${form.ruc}` : "http://localhost:5000/clientes";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.mensaje || "Error guardando cliente");

      if (isEditing) {
        setClientes(clientes.map(c => c.ruc === form.ruc ? data.data : c));
      } else {
        setClientes([...clientes, data.data]);
      }
      setMensaje(data.mensaje);
      setError(null);
      setForm({ ruc: "", razon_social: "", email: "", telefono: "", direccion: "" });
      setIsEditing(false); // volver a modo registrar
    } catch (err) {
      setMensaje(null);
      setError(err.message);
    }
  };

  const handleDelete = async (ruc) => {
    try {
      const res = await fetch(`http://localhost:5000/clientes/${ruc}`, {
        method: "DELETE",
        headers: authHeaders,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.mensaje || "Error eliminando cliente");
      setClientes(clientes.filter(c => c.ruc !== ruc));
      setMensaje(data.mensaje);
      setError(null);
    } catch (err) {
      setMensaje(null);
      setError(err.message);
    }
  };

  const handleEdit = (cliente) => {
    setForm(cliente);
    setIsEditing(true);
  };

  return (
  <>
    <h2 style={styles.title}>📋 Registro de Clientes</h2>

    {/* Bloques en paralelo */}
    <div style={styles.cardContainer}>
      {/* Bloque 1: Formulario */}
      <div style={styles.card}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}

        <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
          <input
            name="ruc"
            value={form.ruc}
            onChange={handleChange}
            placeholder="RUC"
            required
            style={styles.input}
          />
          <input
            name="razon_social"
            value={form.razon_social}
            onChange={handleChange}
            placeholder="Razón Social"
            required
            style={styles.input}
          />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
            style={styles.input}
          />
          <input
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            placeholder="Teléfono"
            style={styles.input}
          />
          <input
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            placeholder="Dirección"
            style={styles.input}
          />

          <button type="submit" style={styles.primaryBtn}>
            {isEditing ? 'Actualizar' : 'Registrar'}
          </button>
        </form>
      </div>

      {/* Bloque 2: Mensajes (opcional, si quieres separarlos) */}
      {/* <div style={styles.card}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      </div> */}
    </div>

    {/* Tabla de clientes */}
    <div style={styles.card}>
      <h3>Lista de Clientes</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#1976d2', color: '#fff' }}>
            <th style={{ padding: 8 }}>RUC</th>
            <th style={{ padding: 8 }}>Razón Social</th>
            <th style={{ padding: 8 }}>Email</th>
            <th style={{ padding: 8 }}>Teléfono</th>
            <th style={{ padding: 8 }}>Dirección</th>
            <th style={{ padding: 8 }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr
              key={c.ruc}
              style={{
                borderBottom: '1px solid #ccc',
                textAlign: 'center',
                verticalAlign: 'middle',
              }}
            >
              <td style={{ padding: 8 }}>{c.ruc}</td>
              <td style={{ padding: 8 }}>{c.razon_social}</td>
              <td style={{ padding: 8 }}>{c.email}</td>
              <td style={{ padding: 8 }}>{c.telefono}</td>
              <td style={{ padding: 8 }}>{c.direccion}</td>
              <td style={{ padding: 8 }}>
                <button
                  style={styles.secondaryBtn}
                  onClick={() => handleEdit(c)}
                >
                  ✏️ Editar
                </button>
                <button
                  style={styles.secondaryBtn}
                  onClick={() => handleDelete(c.ruc)}
                >
                  ❌ Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
);
};

export default RegistroClientes;