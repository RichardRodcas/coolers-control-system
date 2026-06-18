import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext.js';
import { getHistorialIngresos, getSS, getCoolersPorOT } from '../api.js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

function Indicadores() {
  const { inventario = [], user = {} } = useContext(AppContext);
  const [movimientos, setMovimientos] = useState([]);
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);
  const [movimientosError, setMovimientosError] = useState(null);

  const getMovimientoFecha = (item) => {
    const fecha = item.fecha || item.fecha_movimiento || item.fechaMovimiento || item.fechaIngreso || item.fecha_ingreso || item.created_at || item.creado_en;
    return fecha ? fecha.toString() : null;
  };

  const fechaToDateKey = (fecha) => {
    const d = new Date(fecha);
    return Number.isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
  };

  const fechaToMonthKey = (fecha) => {
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const [dataEntradasDiarias, setDataEntradasDiarias] = useState([]);
  const [dataEntradasMensuales, setDataEntradasMensuales] = useState([]);
  const [ingresosHoy, setIngresosHoy] = useState(0);
  const [salidasHoy, setSalidasHoy] = useState(0);

  // Clientes por salidas (SS). Calculamos usando /ss + /coolers/por-ot
  const [dataClientes, setDataClientes] = useState([]);
  const [clientesLoading, setClientesLoading] = useState(false);
  const [clientesError, setClientesError] = useState(null);

  useEffect(() => {
    if ((user?.role || '').toLowerCase() !== 'admin') return;
    const cargarMovimientos = async () => {
      setLoadingMovimientos(true);
      setMovimientosError(null);
      try {
        const data = await getHistorialIngresos();
        setMovimientos(data || []);
      } catch (err) {
        setMovimientosError(err.response?.data?.mensaje || err.message || 'Error cargando movimientos');
        setMovimientos([]);
      } finally {
        setLoadingMovimientos(false);
      }
    };

    cargarMovimientos();
  }, [user]);

  useEffect(() => {
    if ((user?.role || '').toLowerCase() !== 'admin') return;
    const countByDate = {};
    const countByMonth = {};
    const hoy = new Date().toISOString().split('T')[0];
    let ingresosHoyCount = 0;

    movimientos.forEach((item) => {
      const fecha = getMovimientoFecha(item);
      const dateKey = fechaToDateKey(fecha);
      const monthKey = fechaToMonthKey(fecha);
      if (dateKey) {
        countByDate[dateKey] = (countByDate[dateKey] || 0) + 1;
        if (dateKey === hoy) ingresosHoyCount += 1;
      }
      if (monthKey) countByMonth[monthKey] = (countByMonth[monthKey] || 0) + 1;
    });

    setDataEntradasDiarias(
      Object.keys(countByDate)
        .sort()
        .map((date) => ({ date, value: countByDate[date] }))
    );

    setDataEntradasMensuales(
      Object.keys(countByMonth)
        .sort()
        .map((month) => ({ month, value: countByMonth[month] }))
    );
    setIngresosHoy(ingresosHoyCount);
  }, [movimientos, user]);

  useEffect(() => {
    if ((user?.role || '').toLowerCase() !== 'admin') return;
    const hoy = new Date().toISOString().split('T')[0];
    setSalidasHoy(
      inventario.filter(
        (c) => c.tipoMovimiento?.toLowerCase() === 'salida' && fechaToDateKey(getMovimientoFecha(c)) === hoy
      ).length
    );
  }, [inventario, user]);

  useEffect(() => {
    if ((user?.role || '').toLowerCase() !== 'admin') return;
    setClientesLoading(true);
    setClientesError(null);
    const cargarClientesPorSS = async () => {
      try {
        const ssList = await getSS(); // retorna { orden_trabajo, cliente }

        // Para cada SS, pedir coolers y contar
        const counts = {};

        await Promise.all(
          ssList.map(async (ss) => {
            try {
              const coolers = await getCoolersPorOT(ss.orden_trabajo);
              const clienteName = ss.cliente || 'Sin cliente';
              counts[clienteName] = (counts[clienteName] || 0) + (Array.isArray(coolers) ? coolers.length : 0);
            } catch (e) {
              // si falla una SS, ignorar y continuar
              console.warn('Error cargando coolers por OT', ss.orden_trabajo, e.message);
            }
          })
        );

        const arr = Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
        setDataClientes(arr);
      } catch (err) {
        setClientesError(err.response?.data?.mensaje || err.message || 'Error cargando SS');
        setDataClientes([]);
      } finally {
        setClientesLoading(false);
      }
    };

    cargarClientesPorSS();
  }, [user]);

  if ((user?.role || '').toLowerCase() !== 'admin') {
    return <div>Acceso denegado</div>;
  }

  const contadores = {
    total: inventario.length,
    operativo: inventario.filter(c => c.estado?.toLowerCase() === 'operativo').length,
    inoperativo: inventario.filter(c => c.estado?.toLowerCase() === 'inoperativo').length,
    observado: inventario.filter(c => c.estado?.toLowerCase() === 'observado').length,
    laboratorio: inventario.filter(c => c.disponibilidad?.toLowerCase() === 'laboratorio').length,
    muestras: inventario.filter(c => c.disponibilidad?.toLowerCase() === 'muestras recibidas').length,
    campo: inventario.filter(c => c.disponibilidad?.toLowerCase() === 'campo').length,
  };

  

  const dataDisponibilidad = [
    { name: 'Laboratorio', value: contadores.laboratorio },
    { name: 'Muestras recibidas', value: contadores.muestras },
    { name: 'Campo', value: contadores.campo },
  ].filter((entry) => entry.value > 0);

  const dataEstados = [
    { name: 'Operativos', value: contadores.operativo },
    { name: 'Inoperativos', value: contadores.inoperativo },
    { name: 'Observados', value: contadores.observado },
  ];

  const COLORS = ['#2e7d32', '#d32f2f', '#fbc02d', '#1976d2', '#6a1b9a'];

  return (
    <div className="indicadores">
      <h2>📊 Indicadores del Sistema</h2>

      {loadingMovimientos && (
        <div style={{ padding: '12px', color: '#555' }}>Cargando datos de ingresos...</div>
      )}
      {movimientosError && (
        <div style={{ padding: '12px', color: '#b71c1c', background: '#ffcdd2', borderRadius: 8, marginBottom: 16 }}>
          {movimientosError}
        </div>
      )}

      <div className="indicador-card-grid">
        <div className="indicador-card">Total: {contadores.total}</div>
        <div className="indicador-card">Operativos: {contadores.operativo}</div>
        <div className="indicador-card">Inoperativos: {contadores.inoperativo}</div>
        <div className="indicador-card">Observados: {contadores.observado}</div>
        <div className="indicador-card">Laboratorio: {contadores.laboratorio}</div>
        <div className="indicador-card">Muestras: {contadores.muestras}</div>
        <div className="indicador-card">Campo: {contadores.campo}</div>
        <div className="indicador-card">Ingresos hoy: {ingresosHoy}</div>
        <div className="indicador-card">Salidas hoy: {salidasHoy}</div>
      </div>

      <div className="indicador-block">
        <div className="indicador-chart-card">
          <h3>Distribución total por ubicación</h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={dataDisponibilidad}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {dataDisponibilidad.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}`, 'Coolers']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="indicador-chart-card">
          <h3>Ingresos diarios</h3>
          {dataEntradasDiarias.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={dataEntradasDiarias} margin={{ top: 15, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#1976d2" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
              No hay datos de ingresos diarios disponibles.
            </div>
          )}
        </div>
      </div>

      <div className="indicador-block">
        <div className="indicador-chart-card">
          <h3>Ingresos mensuales</h3>
          {dataEntradasMensuales.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={dataEntradasMensuales} margin={{ top: 15, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#388e3c" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
              No hay datos de ingresos mensuales disponibles.
            </div>
          )}
        </div>

        <div className="indicador-chart-card">
          <h3>Clientes con más coolers</h3>
          {clientesLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Cargando clientes...</div>
          ) : clientesError ? (
            <div style={{ padding: 12, color: '#b71c1c', background: '#ffcdd2', borderRadius: 8 }}>{clientesError}</div>
          ) : dataClientes.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={dataClientes} margin={{ top: 15, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-30} textAnchor="end" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#6a1b9a" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>No hay datos de salidas por cliente.</div>
          )}
        </div>
      </div>

      <div className="indicador-block">
        <div className="indicador-chart-card" style={{ width: '100%' }}>
          <h3>Estados de los coolers</h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={dataEstados}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {dataEstados.map((entry, index) => (
                  <Cell key={`state-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}`, 'Coolers']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Indicadores;
