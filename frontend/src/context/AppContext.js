// src/context/AppContext.js
import { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

export function AppProvider({ children }) {
  // Estado global para usuario
  const [user, setUser] = useState(null);

  // Restaurar sesión desde localStorage (si guardas el user allí)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error parseando user de localStorage", err);
      }
    }
  }, []);

  // Estados globales
  const [trazabilidad, setTrazabilidad] = useState({ detalle: null, historial: [], error: '' });
  const [buscarOT, setBuscarOT] = useState({ resultados: [], error: '' });
  const [inventario, setInventario] = useState([]);
  const [ingreso, setIngreso] = useState({ codigos: [], feedback: null });
  const [salida, setSalida] = useState({ codigos: [], clientes: [], clienteSeleccionado: null, ordenTrabajo: '', feedback: null });
  const [mantenimiento, setMantenimiento] = useState({ tab: 'crear', codigo: '', estado: '', observacion: '', mensaje: '', coolerActual: null });
  const [usuariosState, setUsuariosState] = useState({ usuarios: [], error: '', mensaje: '' });
  const [clientesState, setClientesState] = useState({ clientes: [], form: { ruc: "", razon_social: "", email: "", telefono: "", direccion: "" }, isEditing: false, mensaje: '', error: '' });
  const [recepcion, setRecepcion] = useState({ codigos: [], feedback: null });

  return (
    <AppContext.Provider value={{
      user, setUser, // 👈 ahora disponible en todos los componentes
      trazabilidad, setTrazabilidad,
      buscarOT, setBuscarOT,
      inventario, setInventario,
      ingreso, setIngreso,
      salida, setSalida,
      mantenimiento, setMantenimiento,
      usuariosState, setUsuariosState,
      clientesState, setClientesState,
      recepcion, setRecepcion
    }}>
      {children}
    </AppContext.Provider>
  );
}
