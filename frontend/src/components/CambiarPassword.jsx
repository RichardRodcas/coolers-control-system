import React, { useState } from "react";
import { updatePassword } from "../api.js";

function CambiarPassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      const res = await updatePassword(oldPassword, newPassword);
      setMessage(res.message); // éxito
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Error al actualizar contraseña");
    }
  };

  return (
    <div style={{ maxWidth: 400 }}>
      <h2>🔑 Cambiar Contraseña</h2>

      {/* Mensajes de feedback */}
      {message && (
        <div style={{ background: "#d4edda", color: "#155724", padding: "8px", borderRadius: "4px", marginBottom: "12px" }}>
          {message}
        </div>
      )}
      {error && (
        <div style={{ background: "#f8d7da", color: "#721c24", padding: "8px", borderRadius: "4px", marginBottom: "12px" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label>Contraseña actual</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Nueva contraseña</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Actualizar</button>
      </form>
    </div>
  );
}

export default CambiarPassword;