// src/views/CambiarPassword.jsx
import React, { useState } from "react";
import { updatePassword } from "../api.js";

function CambiarPassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updatePassword(oldPassword, newPassword);
      alert(res.message);
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      alert(err.response?.data?.error || "Error al actualizar contraseña");
    }
  };

  return (
    <div style={{ maxWidth: 400 }}>
      <h2>🔑 Cambiar Contraseña</h2>
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