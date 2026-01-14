// src/api.js
import axios from "axios";

const API_URL = "http://localhost:5000"; // apunta al server.js de negocio
const AUTH_URL = "http://localhost:4000"; // apunta al authServer.js

// Instancia global de Axios
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ======================= TOKEN =======================
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log("Token inyectado en Axios:", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    console.log("Token eliminado de Axios");
  }
};

// ======================= INVENTARIO =======================
export const getCoolers = async () => {
  const res = await api.get("/coolers");

  // 👇 Normalizamos la respuesta para que siempre sea un array
  if (Array.isArray(res.data)) {
    return res.data;
  }
  if (Array.isArray(res.data?.data)) {
    return res.data.data;
  }
  return []; // fallback seguro
};

// ======================= INGRESO =======================
export const ingresoCoolers = async (codigos) => {
  const res = await api.post("/coolers/ingreso", { codigos });
  return res.data;
};

// ======================= SALIDA =======================
export const salidaCoolers = async (codigos, clienteRuc, ordenTrabajo) => {
  const res = await api.post("/coolers/salida", { codigos, clienteRuc, ordenTrabajo });
  return res.data;
};

// ======================= MANTENIMIENTO =======================
export const createCooler = async (cooler) => {
  console.log("Payload enviado a /coolers/nuevo:", cooler);
  const res = await api.post("/coolers/nuevo", cooler);
  return res.data;
};

export const updateMantenimiento = async (codigo, data) => {
  console.log("Payload enviado a /coolers/:codigo/mantenimiento:", data);
  const res = await api.put(`/coolers/${codigo}/mantenimiento`, data);
  return res.data;
};

export const deleteCooler = async (codigo) => {
  const res = await api.delete(`/coolers/${codigo}`);
  return res.data;
};

// ======================= TRAZABILIDAD =======================
// ======================= TRAZABILIDAD =======================
export const getTrazabilidad = async (codigo) => {
  const res = await api.get(`/coolers/${codigo}/trazabilidad`);
  return res.data?.data || { detalle: null, historial: [] };
};

export const getDetalleCooler = async (codigo) => {
  const res = await api.get(`/coolers/${codigo}/detalle`);
  return res.data?.data || null; // 👈 devuelve directamente el objeto cooler
};

// ======================= VALIDACIÓN DE CÓDIGOS =======================
export const validateCode = async (code) => {
  const res = await api.post("/api/validate-code", { code });
  return res.data;
};

// ======================= USUARIOS =======================

// Listar usuarios (requiere rol admin)
export const getUsuarios = async () => {
  const res = await api.get("/auth/usuarios");
  return res.data?.data || [];
};

// Crear usuario
export const createUsuario = async (usuario) => {
  const res = await api.post("/auth/usuarios", usuario);
  return res.data;
};

// Actualizar usuario
export const updateUsuario = async (id, usuario) => {
  const res = await api.put(`/auth/usuarios/${id}`, usuario);
  return res.data;
};

// Eliminar usuario
export const deleteUsuario = async (id) => {
  const res = await api.delete(`/auth/usuarios/${id}`);
  return res.data;
};