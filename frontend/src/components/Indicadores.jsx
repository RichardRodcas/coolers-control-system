import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext.js';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

function Indicadores() {
  // Usamos la clave correcta del contexto
  const { inventario = [], user = {} } = useContext(AppContext);

  // 👀 Log para depuración: revisa en la consola qué llega
  console.log("Indicadores recibe desde AppContext:", user);

  // Solo mostrar si el usuario es administrador
  if ((user?.role || '').toLowerCase() !== 'admin') {
    return <div>Acceso denegado</div>;
  }

  // Contadores con protección
  const contadores = {
    total: inventario.length,
    operativo: inventario.filter(c => c.estado?.toLowerCase() === 'operativo').length,
    inoperativo: inventario.filter(c => c.estado?.toLowerCase() === 'inoperativo').length,
    observado: inventario.filter(c => c.estado?.toLowerCase() === 'observado').length,
    laboratorio: inventario.filter(c => c.disponibilidad?.toLowerCase() === 'laboratorio').length,
    muestras: inventario.filter(c => c.disponibilidad?.toLowerCase() === 'muestras recibidas').length,
    campo: inventario.filter(c => c.disponibilidad?.toLowerCase() === 'campo').length,
  };

  // Datos para gráficos
  const dataDisponibilidad = [
    { name: 'Laboratorio', value: contadores.laboratorio },
    { name: 'Muestras recibidas', value: contadores.muestras },
    { name: 'Campo', value: contadores.campo },
  ];

  const dataEstados = [
    { name: 'Operativos', value: contadores.operativo },
    { name: 'Inoperativos', value: contadores.inoperativo },
    { name: 'Observados', value: contadores.observado },
  ];

  const COLORS = ['#2e7d32', '#d32f2f', '#fbc02d', '#1976d2', '#6a1b9a'];

  // Fecha de hoy (sin horas)
  const hoy = new Date().toISOString().split('T')[0];
  // Contadores diarios
const ingresosHoy = inventario.filter(c => 
  c.tipoMovimiento?.toLowerCase() === 'ingreso' &&
  c.fecha?.startsWith(hoy)
).length;

const salidasHoy = inventario.filter(c => 
  c.tipoMovimiento?.toLowerCase() === 'salida' &&
  c.fecha?.startsWith(hoy)
).length;

// Agrupación por cliente
const clientesMap = {};
inventario.forEach(c => {
  const cliente = c.cliente?.razon_social || c.cliente?.nombre || 'Sin cliente';
  clientesMap[cliente] = (clientesMap[cliente] || 0) + 1;
});
const dataClientes = Object.entries(clientesMap).map(([name, value]) => ({ name, value }));
  return (
    <div className="indicadores">
      <h2>📊 Indicadores del Sistema</h2>

      {/* Tarjetas simples */}
      <div className="indicador-card">Total: {contadores.total}</div>
      <div className="indicador-card">Operativos: {contadores.operativo}</div>
      <div className="indicador-card">Inoperativos: {contadores.inoperativo}</div>
      <div className="indicador-card">Observados: {contadores.observado}</div>
      <div className="indicador-card">Laboratorio: {contadores.laboratorio}</div>
      <div className="indicador-card">Muestras recibidas: {contadores.muestras}</div>
      <div className="indicador-card">Campo: {contadores.campo}</div>

      {/* Gráfico de barras: Disponibilidad */}
      <h3>Disponibilidad</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dataDisponibilidad}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#1976d2" />
        </BarChart>
      </ResponsiveContainer>

      {/* Gráfico de torta: Estados */}
      <h3>Estados</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={dataEstados}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {dataEstados.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="indicador-card">Ingresos hoy: {ingresosHoy}</div>
<div className="indicador-card">Salidas hoy: {salidasHoy}</div>

<h3>Coolers por Cliente</h3>
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={dataClientes}>
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="value" fill="#6a1b9a" />
  </BarChart>
</ResponsiveContainer>
    </div>
  );
}

export default Indicadores;
