// src/api.js
import axios from "axios";

const API_URL = "https://192.168.0.95:5000";   // negocio (server.js)
const AUTH_URL = "https://192.168.0.95:4000";  // autenticación (authServer.js)

// ======================= INSTANCIAS =======================
// Instancia para negocio
 export const api = axios.create({
  baseURL: API_URL,
  //headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Instancia para autenticación
export const authApi = axios.create({
  baseURL: AUTH_URL,
  //headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ======================= TOKEN =======================
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    authApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log("Token inyectado en Axios:", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    delete authApi.defaults.headers.common["Authorization"];
    console.log("Token eliminado de Axios");
  }
};

// ======================= INVENTARIO =======================
export const getCoolers = async () => {
  console.log("Headers en getCoolers:", api.defaults.headers.common);
  const res = await api.get("/coolers");
  return res.data.data || [];   // 👈 siempre devuelve el array
};

export const ingresoCoolers = async (codigos) => {
  const res = await api.post("/coolers/ingreso", { codigos });
  return res.data;
};

export const salidaCoolers = async (codigos, clienteRuc, ordenTrabajo) => {
  const res = await api.post("/coolers/salida", { codigos, clienteRuc, ordenTrabajo });
  return res.data;
};

export const recepcionCoolers= async (codigos) => {
  const res = await api.post("/coolers/recepcion", { codigos });
  return res.data;
}

export const createCooler = async (cooler) => {
  const res = await api.post("/coolers/nuevo", cooler);
  return res.data;
};

export const updateMantenimiento = async (codigo, data) => {
  const res = await api.put(`/coolers/${codigo}/mantenimiento`, data);
  return res.data;
};

export const deleteCooler = async (codigo) => {
  const res = await api.delete(`/coolers/${codigo}`);
  return res.data;
};

// ======================= TRAZABILIDAD =======================
export const getTrazabilidad = async (codigo) => {
  const res = await api.get(`/coolers/${codigo}/trazabilidad`);
  return res.data?.data || { detalle: null, historial: [] };
};

export const getDetalleCooler = async (codigo) => {
  const res = await api.get(`/coolers/${codigo}/detalle`);
  return res.data?.data || null;
};

// ======================= VALIDACIÓN DE CÓDIGOS =======================
export const validateCode = async (code) => {
  const res = await api.post("/api/validate-code", { code });
  return res.data;
};

// ======================= USUARIOS (AUTH) =======================
export const getUsuarios = async () => {
  const res = await authApi.get("/auth/usuarios");
  return res.data?.data || [];
};

export const createUsuario = async (usuario) => {
  const res = await authApi.post("/auth/usuarios", usuario);
  return res.data;
};

export const updateUsuario = async (id, usuario) => {
  const res = await authApi.put(`/auth/usuarios/${id}`, usuario);
  return res.data;
};

export const deleteUsuario = async (id) => {
  const res = await authApi.delete(`/auth/usuarios/${id}`);
  return res.data;
};

// ======================= INTERCEPTORES =======================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("[AXIOS] Interceptor detectó error:", error);
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn("[AXIOS] 401 detectado en:", originalRequest.url);
      originalRequest._retry = true;
      try {
        console.log("[AXIOS] Intentando refresh...");
        const res = await authApi.post("/auth/refresh", {}, { withCredentials: true });
        console.log("[AXIOS] Respuesta refresh:", res.status, res.data);

        const newAccessToken = res.data.accessToken;
        setAuthToken(newAccessToken);

        // Reasignar cabecera explícitamente
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`,
        };

        console.log("[AXIOS] Reintentando request con nuevo token:", newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        console.error("❌ Error al refrescar token:", refreshError);
      }
    }
    return Promise.reject(error);
  }
);

//========= Cambio de contraseña ==========
export async function updatePassword(oldPassword, newPassword) {
  const res = await authApi.put("/auth/update-password", {
    oldPassword,
    newPassword,
  });
  return res.data;
}


// ======================= CLIENTES =======================
export const getClientes = async () => {
  const res = await api.get("/clientes");
  return res.data?.data || [];
};

// ======================= SS (Órdenes de salida) =======================
export const getSS = async (clienteRuc) => {
  const params = clienteRuc ? { clienteRuc } : {};
  const res = await api.get("/ss", { params });
  return res.data?.data || [];
};

// ======================= COOLERS POR OT =======================
export const getCoolersPorOT = async (ordenTrabajo) => {
  const res = await api.get(`/coolers/por-ot/${ordenTrabajo}`);
  return res.data?.data || [];
};


// ======================= EQUIPOS =======================
export const getEquipos = async () => {
  const res = await api.get("/api/equipos");
  return res.data?.data || [];
};

export const createEquipo = async (equipo) => {
  const res = await api.post("/api/equipos/ingreso", equipo);
  return res.data;
};

export const updateEquipo = async (codigo, data) => {
  const res = await api.put(`/api/equipos/${codigo}`, data);
  return res.data;
};

export const deleteEquipo = async (codigo) => {
  const res = await api.delete(`/api/equipos/${codigo}`);
  return res.data;
};

export const getDetalleEquipo = async (codigo) => {
  const res = await api.get(`/api/equipos/${codigo}`);
  return res.data?.data || null;
};
