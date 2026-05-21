// src/components/CambiarPassword.jsx
import React, { useState } from "react";
import { updatePassword } from "../api.js";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// Componente reutilizable para inputs con ojito
const PasswordInput = ({ label, value, onChange, show, setShow }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <label>{label}</label>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: "1px solid #ccc",
        borderRadius: 4,
        padding: "0 8px",
        background: "#fff",
      }}
    >
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        required
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          padding: "8px",
        }}
      />
      <span
        onClick={() => setShow(!show)}
        style={{ cursor: "pointer", color: "#555", marginLeft: 8 }}
      >
        {show ? <FaEyeSlash /> : <FaEye />}
      </span>
    </div>
  </div>
);

function CambiarPassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      const res = await updatePassword(oldPassword, newPassword);
      setMessage(res.message);
      // limpiar campos solo al enviar
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Error al actualizar contraseña");
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "40px auto",
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 8,
        background: "#fafafa",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>
        🔑 Cambiar Contraseña
      </h2>

      {message && (
        <div
          style={{
            background: "#d4edda",
            color: "#155724",
            padding: "8px",
            borderRadius: "4px",
            marginBottom: "12px",
          }}
        >
          {message}
        </div>
      )}
      {error && (
        <div
          style={{
            background: "#f8d7da",
            color: "#721c24",
            padding: "8px",
            borderRadius: "4px",
            marginBottom: "12px",
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <PasswordInput
          label="Contraseña actual"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          show={showOld}
          setShow={setShowOld}
        />

        <PasswordInput
          label="Nueva contraseña"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          show={showNew}
          setShow={setShowNew}
        />

        <button
          type="submit"
          style={{
            background: "#007bff",
            color: "#fff",
            padding: "10px",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Actualizar
        </button>
      </form>
    </div>
  );
}

export default CambiarPassword;
