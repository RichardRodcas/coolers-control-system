import React, { useEffect, useContext, useMemo } from "react";
import { useAuth } from "../AuthContext.jsx";
import { styles } from "../styles/styles.js";
import "../styles/App.css";
import { CardContainer } from "./CardContainer.jsx";
import { Card } from "./Card.jsx";
import { AppContext } from "../context/AppContext.js";

const RegistroClientes = () => {
  const { user, isAuthed } = useAuth();
  const { clientesState, setClientesState } = useContext(AppContext);
  const { clientes, form, isEditing, mensaje, error } = clientesState;

  const token = localStorage.getItem("token");

  // ✅ useMemo dentro del componente
  const authHeaders = useMemo(() => (
    token ? { "Authorization": `Bearer ${token}` } : {}
  ), [token]);

  useEffect(() => {
    const cargar = async () => {
      if (!token) {
        setClientesState(prev => ({ ...prev, error: "No hay token de autenticación. Inicia sesión." }));
        return;
      }
      try {
        const res = await fetch("https://192.168.0.95:5000/clientes", {
          headers: authHeaders,
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.mensaje || "Error cargando clientes");
        setClientesState(prev => ({ ...prev, clientes: data.data, error: null }));
      } catch (err) {
        setClientesState(prev => ({ ...prev, error: err.message }));
      }
    };
    if (isAuthed && user?.role === "admin" && clientes.length === 0) cargar();
  }, [isAuthed, user, token, authHeaders, setClientesState, clientes.length]);

  if (!isAuthed || user?.role !== "admin") {
    return <p>No tienes permisos para acceder a este módulo.</p>;
  }

  const handleChange = (e) =>
    setClientesState(prev => ({ ...prev, form: { ...prev.form, [e.target.name]: e.target.value } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEditing
        ? `https://192.168.0.95:5000/clientes/${form.ruc}`
        : "https://192.168.0.95:5000/clientes";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.mensaje || "Error guardando cliente");

      setClientesState(prev => ({
        ...prev,
        clientes: isEditing
          ? prev.clientes.map(c => c.ruc === form.ruc ? data.data : c)
          : [...prev.clientes, data.data],
        mensaje: data.mensaje,
        error: null,
        form: { ruc: "", razon_social: "", email: "", telefono: "", direccion: "" },
        isEditing: false
      }));
    } catch (err) {
      setClientesState(prev => ({ ...prev, mensaje: null, error: err.message }));
    }
  };

  const handleDelete = async (ruc) => {
    try {
      const res = await fetch(`https://192.168.0.95:5000/clientes/${ruc}`, {
        method: "DELETE",
        headers: authHeaders,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.mensaje || "Error eliminando cliente");
      setClientesState(prev => ({
        ...prev,
        clientes: prev.clientes.filter(c => c.ruc !== ruc),
        mensaje: data.mensaje,
        error: null
      }));
    } catch (err) {
      setClientesState(prev => ({ ...prev, mensaje: null, error: err.message }));
    }
  };

  const handleEdit = (cliente) => {
    setClientesState(prev => ({ ...prev, form: cliente, isEditing: true }));
  };

  return (
    <>
      <h2 style={styles.title}>📋 Registro de Clientes</h2>

      <CardContainer>
        {/* Bloque 1: Formulario */}
        <Card>
          {error && <p className="errorMsg">{error}</p>}
          {mensaje && <p className="successMsg">{mensaje}</p>}

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
              {isEditing ? "Actualizar" : "Registrar"}
            </button>
          </form>
        </Card>
      </CardContainer>

      {/* Tabla de clientes */}
      <Card>
        <h3>Lista de Clientes</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#1976d2", color: "#fff" }}>
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
                    borderBottom: "1px solid #ccc",
                    textAlign: "center",
                    verticalAlign: "middle",
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
                      style={styles.dangerBtn}
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
      </Card>
    </>
  );
};

export default RegistroClientes;