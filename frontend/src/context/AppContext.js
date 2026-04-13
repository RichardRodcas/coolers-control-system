// src/context/AppContext.js
import { createContext, useState } from "react";

export const AppContext = createContext();

export function AppProvider({ children }) {
  // Estados globales
  const [trazabilidad, setTrazabilidad] = useState({
    detalle: null,
    historial: [],
    error: ''
  });

  const [buscarOT, setBuscarOT] = useState({
    resultados: [],
    error: ''
  });

  const [inventario, setInventario] = useState([]);

  const [ingreso, setIngreso] = useState({
    codigos: [],
    feedback: null
  });

  const [salida, setSalida] = useState({
    codigos: [],
    clientes: [],
    clienteSeleccionado: null,
    ordenTrabajo: '',
    feedback: null
  });

  const [mantenimiento, setMantenimiento] = useState({
    tab: 'crear',
    codigo: '',
    estado: '',
    observacion: '',
    mensaje: '',
    coolerActual: null
  });

  const [usuariosState, setUsuariosState] = useState({
    usuarios: [],
    error: '',
    mensaje: ''
  });

  const [clientesState, setClientesState] = useState({
    clientes: [],
    form: { ruc: "", razon_social: "", email: "", telefono: "", direccion: "" },
    isEditing: false,
    mensaje: '',
    error: ''
  });

  return (
    <AppContext.Provider value={{
      trazabilidad, setTrazabilidad,
      buscarOT, setBuscarOT,
      inventario, setInventario,
      ingreso, setIngreso,
      salida, setSalida,
      mantenimiento, setMantenimiento,
      usuariosState, setUsuariosState,
      clientesState, setClientesState
    }}>
      {children}
    </AppContext.Provider>
  );
}