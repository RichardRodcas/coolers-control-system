// src/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { setAuthToken } from "./api.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isAuthed, setIsAuthed] = useState(false);

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

      setUser({ role: data.role, name: data.name });
      setAccessToken(data.accessToken);
      setIsAuthed(true);

      // Guardar en localStorage
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify({ role: data.role, name: data.name }));

      // Sincroniza Axios
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

      // Limpiar localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Limpia Axios
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
        setUser({ role: data.role, name: data.name });
        setAccessToken(data.accessToken);
        setIsAuthed(true);

        // Guardar en localStorage
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("user", JSON.stringify({ role: data.role, name: data.name }));

        // Sincroniza Axios
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

  // Al montar, recuperar token/usuario de localStorage
  useEffect(() => {
  console.log("[AUTH] useEffect inicial ejecutado");

  const savedToken = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");

  if (savedToken && savedUser) {
    console.log("[AUTH] Restaurando sesión desde localStorage");
    setAccessToken(savedToken);
    setUser(JSON.parse(savedUser));
    setIsAuthed(true);
    setAuthToken(savedToken);

    // 👇 Forzar refresh para validar/renovar token
    refresh();
  } else {
    console.log("[AUTH] No hay token → llamando refresh()");
    refresh();
  }
}, []);

  // Sincroniza Axios cada vez que cambie el accessToken
  useEffect(() => {
    setAuthToken(accessToken);
  }, [accessToken]);

  return (
    <AuthContext.Provider value={{ user, accessToken, isAuthed, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);