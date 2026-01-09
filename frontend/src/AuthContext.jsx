// src/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { setAuthToken } from "./api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isAuthed, setIsAuthed] = useState(false);

  // Login
  const login = async (email, password) => {
    try {
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error en login");

      setUser({ role: data.role, name: data.name });
      setAccessToken(data.accessToken);
      localStorage.setItem('token', data.accessToken);
      setIsAuthed(true);

      // 👇 sincroniza inmediatamente Axios
      setAuthToken(data.accessToken);
    } catch (err) {
      console.error("Error en login:", err);
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await fetch("http://localhost:4000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Error en logout:", err);
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('token');
      setIsAuthed(false);

      // 👇 limpia Axios
      setAuthToken(null);
    }
  };

  // Refresh token al montar
  const refresh = async () => {
    try {
      const res = await fetch("http://localhost:4000/auth/refresh", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.accessToken) {
        setUser({ role: data.role, name: data.name });
        setAccessToken(data.accessToken);
        localStorage.setItem('token', data.accessToken);
        setIsAuthed(true);

        // 👇 sincroniza Axios
        setAuthToken(data.accessToken);
      }
    } catch (err) {
      console.error("Error en refresh:", err);
      setIsAuthed(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // 👇 sincroniza Axios cada vez que cambie el accessToken
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