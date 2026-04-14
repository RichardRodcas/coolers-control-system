// src/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { setAuthToken } from "./api.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true); // 👈 nuevo flag

  // Login
  const login = async (email, password) => {
    try {
      const res = await fetch("https://192.168.0.95:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error en login");

      setUser(data.user || { role: data.role, name: data.name });
      setAccessToken(data.accessToken);
      setIsAuthed(true);

      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user || { role: data.role, name: data.name }));

      setAuthToken(data.accessToken);
    } catch (err) {
      console.error("Error en login:", err);
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await fetch("https://192.168.0.95:4000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Error en logout:", err);
    } finally {
      setUser(null);
      setAccessToken(null);
      setIsAuthed(false);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setAuthToken(null);
    }
  };

  // Refresh token
  const refresh = async () => {
    console.log("[REFRESH] Intentando renovar sesión...");
    try {
      const res = await fetch("https://192.168.0.95:4000/auth/refresh", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.accessToken) {
        setUser(data.user || { role: data.role, name: data.name });
        setAccessToken(data.accessToken);
        setIsAuthed(true);

        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user || { role: data.role, name: data.name }));

        setAuthToken(data.accessToken);
        console.log("[REFRESH] Sesión renovada y guardada en localStorage");
      } else {
        console.warn("[REFRESH] No se pudo renovar el token");
        setIsAuthed(false);
      }
    } catch (err) {
      console.error("Error en refresh:", err);
      setIsAuthed(false);
    }
  };

  // Al montar, recuperar token/usuario de localStorage y forzar refresh
  useEffect(() => {
    console.log("[AUTH] useEffect inicial ejecutado");
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      console.log("[AUTH] Restaurando sesión desde localStorage");
      setAccessToken(savedToken);
      setUser(JSON.parse(savedUser));
      setAuthToken(savedToken);
    }
    refresh().finally(() => setLoading(false));
  }, []);

  // Sincroniza Axios cada vez que cambie el accessToken
  useEffect(() => {
    setAuthToken(accessToken);
  }, [accessToken]);

  // 👇 Interceptor Axios para manejar 401 automáticamente
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      res => res,
      async (error) => {
        if (error.response?.status === 401) {
          try {
            await refresh();
            error.config.headers["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
            return axios(error.config);
          } catch (err) {
            logout();
            return Promise.reject(err);
          }
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, isAuthed, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);