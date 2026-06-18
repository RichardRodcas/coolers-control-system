import React, { useState, useEffect } from "react";
import { getHistorialIngresos } from "../api.js";
import { FaCalendarAlt, FaSync, FaDownload } from "react-icons/fa";

function HistorialCoolers() {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // Cargar historial al montar y cuando cambian las fechas
  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    setLoading(true);
    setError(null);
    try {
      const datos = await getHistorialIngresos(fechaInicio, fechaFin);
      if (!Array.isArray(datos)) {
        setError("Formato de datos inválido desde el servidor");
        setHistorial([]);
        return;
      }
      // Ordenar de más reciente a más antiguo
      const ordenado = datos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setHistorial(ordenado);
    } catch (err) {
      console.error("Error cargando historial:", err);
      const mensajeError = err.response?.data?.mensaje || err.message || "Error al cargar historial";
      setError(mensajeError);
      setHistorial([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltrar = (e) => {
    e.preventDefault();
    cargarHistorial();
  };

  const handleLimpiarFiltros = () => {
    setFechaInicio("");
    setFechaFin("");
    setHistorial([]);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportarCSV = () => {
    if (historial.length === 0) {
      alert("No hay datos para exportar");
      return;
    }

    const headers = ["Código", "Tipo", "Cliente", "Detalle", "Fecha"];
    const rows = historial.map((item) => [
      item.codigo_equipo || item.codigo,
      item.tipo,
      item.cliente || "-",
      item.detalle,
      formatearFecha(item.fecha),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historial_coolers_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "20px auto",
        padding: 20,
        background: "#fafafa",
        borderRadius: 8,
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 30 }}>
        📋 Historial de Ingresos de Coolers
      </h2>

      {/* Formulario de Filtros */}
      <form
        onSubmit={handleFiltrar}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 12,
          marginBottom: 24,
          padding: 16,
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: 8,
        }}
      >
        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
            <FaCalendarAlt style={{ marginRight: 6 }} />
            Desde
          </label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: 4,
              fontSize: 14,
              boxSizing: "border-box",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
            <FaCalendarAlt style={{ marginRight: 6 }} />
            Hasta
          </label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: 4,
              fontSize: 14,
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: "8px 12px",
              background: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <FaSync style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            {loading ? "Cargando..." : "Filtrar"}
          </button>
          <button
            type="button"
            onClick={handleLimpiarFiltros}
            style={{
              flex: 1,
              padding: "8px 12px",
              background: "#6c757d",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Limpiar
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button
            type="button"
            onClick={exportarCSV}
            disabled={historial.length === 0}
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: historial.length === 0 ? "not-allowed" : "pointer",
              opacity: historial.length === 0 ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <FaDownload />
            Exportar CSV
          </button>
        </div>
      </form>

      {/* Mensaje de error */}
      {error && (
        <div
          style={{
            background: "#f8d7da",
            color: "#721c24",
            padding: "12px",
            borderRadius: "4px",
            marginBottom: "12px",
            border: "1px solid #f5c6cb",
          }}
        >
          {error}
        </div>
      )}

      {/* Tabla de resultados */}
      {historial.length > 0 ? (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
              borderRadius: 8,
              overflow: "hidden",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <thead>
              <tr style={{ background: "#007bff", color: "#fff" }}>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #0056b3" }}>
                  Código
                </th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #0056b3" }}>
                  Tipo
                </th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #0056b3" }}>
                  Cliente
                </th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #0056b3" }}>
                  Detalle
                </th>
                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #0056b3" }}>
                  Fecha y Hora
                </th>
              </tr>
            </thead>
            <tbody>
              {historial.map((item, index) => (
                <tr
                  key={index}
                  style={{
                    background: index % 2 === 0 ? "#fff" : "#f9f9f9",
                    borderBottom: "1px solid #ddd",
                    transition: "background 0.2s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "#e7f3ff")}
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = index % 2 === 0 ? "#fff" : "#f9f9f9")
                  }
                >
                  <td style={{ padding: "12px", fontWeight: 600, color: "#007bff" }}>
                    {item.codigo_equipo || item.codigo || "-"}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        background:
                          item.tipo === "Ingreso"
                            ? "#d4edda"
                            : item.tipo === "Salida"
                            ? "#fff3cd"
                            : "#d1ecf1",
                        color:
                          item.tipo === "Ingreso"
                            ? "#155724"
                            : item.tipo === "Salida"
                            ? "#856404"
                            : "#0c5460",
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {item.tipo}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>{item.cliente || "-"}</td>
                  <td style={{ padding: "12px" }}>{item.detalle}</td>
                  <td style={{ padding: "12px", color: "#666", fontSize: 14 }}>
                    {formatearFecha(item.fecha)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div
            style={{
              marginTop: 12,
              textAlign: "right",
              color: "#666",
              fontSize: 14,
            }}
          >
            Total de registros: <strong>{historial.length}</strong>
          </div>
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "#999",
            background: "#fff",
            borderRadius: 8,
            border: "1px solid #ddd",
          }}
        >
          {loading ? "Cargando historial..." : "No hay registros para mostrar"}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default HistorialCoolers;
