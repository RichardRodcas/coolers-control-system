import React, { useState, useEffect } from "react";

function ResetRequestsAdmin() {
  const [requests, setRequests] = useState([]);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  // Cargar solicitudes al montar
  useEffect(() => {
    fetch("https://192.168.0.95:5000/admin/reset-requests")
      .then(res => res.json())
      .then(data => setRequests(data))
      .catch(() => setMessage("Error al cargar solicitudes"));
  }, []);

  const handleReset = async (email) => {
    try {
      const res = await fetch("https://192.168.0.95:5000/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, nuevaPassword: newPassword }),
      });
      const data = await res.json();
      setMessage(data.mensaje);

      // Actualizar lista local
      setRequests(requests.map(r =>
        r.email === email ? { ...r, processed: true } : r
      ));
    } catch {
      setMessage("Error al resetear contraseña");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 20, border: "1px solid #ddd", borderRadius: 8 }}>
      <h2>🔑 Panel de Resets (Admin)</h2>
      {message && <p>{message}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Correo</th>
            <th style={{ borderBottom: "1px solid #ccc" }}>Estado</th>
            <th style={{ borderBottom: "1px solid #ccc" }}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(requests) && requests.map((req) => (
            <tr key={req.id}>
              <td>{req.email}</td>
              <td>{req.processed ? "Procesado" : "Pendiente"}</td>
              <td>
                {!req.processed && (
                  <>
                    <input
                      type="text"
                      placeholder="Nueva contraseña"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ marginRight: 8 }}
                    />
                    <button onClick={() => handleReset(req.email)}>Resetear</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ResetRequestsAdmin;
