export const styles = {
  // Contenedor principal
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    border: '1px solid #2196F3',
    borderRadius: 8,
    padding: 20,
    maxWidth: 1200,
    margin: '20px auto',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
  },
  title: { color: '#1976d2', marginBottom: 12 },
  subtitle: { marginTop: 16, color: '#37474f' },

  // Formularios
  formRow: { display: 'flex', gap: 12, alignItems: 'flex-end' },
  formGroup: { flex: 1, marginBottom: 12 },
  label: { display: 'block', marginBottom: 6, fontWeight: 'bold', color: '#455a64' },
  input: {
    width: '100%',
    padding: 8,
    borderRadius: 4,
    border: '1px solid #cfd8dc',
    background: 'white'
  },

  // Botones básicos
  primaryBtn: {
    background: '#1976d2',
    color: 'white',
    border: 'none',
    padding: '10px 14px',
    borderRadius: 4,
    cursor: 'pointer'
  },
  dangerBtn: {
    background: '#d32f2f',
    color: 'white',
    border: 'none',
    padding: '10px 14px',
    borderRadius: 4,
    cursor: 'pointer'
  },
  secondaryBtn: {
    background: '#9e9e9e',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: 4,
    cursor: 'pointer'
  },

  // Botones principales de navegación
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '12px 20px',
    borderRadius: 6,
    fontWeight: 'bold',
    fontSize: '14px',
    color: 'white',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  },
  btnIngreso: {
    background: 'linear-gradient(45deg, #2e7d32, #66bb6a)' // verde
  },
  btnSalida: {
    background: 'linear-gradient(45deg, #1976d2, #64b5f6)' // azul
  },
  btnInventario: {
    background: 'linear-gradient(45deg, #6a1b9a, #ab47bc)' // morado
  },
  btnTrazabilidad: {
    background: 'linear-gradient(45deg, #fbc02d, #fdd835)', // amarillo
    color: '#212121' // texto oscuro para contraste
  },
  btnMantenimiento: {
    background: 'linear-gradient(45deg, #d32f2f, #ef5350)' // rojo (coolers)
  },
  btnRegistro: {
    backgroundColor: '#4caf50', // verde claro
    color: '#fff'
  },
  btnMantenimientoUsuario: {
    background: 'linear-gradient(45deg, #00897b, #26a69a)', // turquesa (usuarios)
    color: '#fff'
  },
  navBtnHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
  },

  // Contadores compactos
  counterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16
  },
  counterBox: {
    flex: '0 0 140px',
    padding: 8,
    borderRadius: 6,
    textAlign: 'center',
    fontSize: '13px',
    fontWeight: 'bold',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    color: 'white'
  },
  counterTotal: { backgroundColor: '#607d8b' },
  counterOperativo: { backgroundColor: '#2e7d32' },
  counterInoperativo: { backgroundColor: '#d32f2f' },
  counterObservado: { backgroundColor: '#fbc02d', color: '#212121' },
  counterLaboratorio: { backgroundColor: '#1976d2' },
  counterCampo: { backgroundColor: '#6a1b9a' },

  // Tabla
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: 16,
    fontSize: '14px'
  },
  th: {
    background: '#eeeeee',
    textAlign: 'left',
    padding: '8px',
    borderBottom: '1px solid #ccc'
  },
  td: {
    padding: '8px',
    borderBottom: '1px solid #eee'
  },

  // Timeline (Trazabilidad)
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginTop: 16,
    position: 'relative'
  },
  timelineItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    background: '#f5f5f5',
    borderRadius: 6,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  timelineIcon: { flexShrink: 0, fontSize: '18px' },
  timelineContent: { flex: 1, fontSize: '14px', color: '#212121' },

  // Tabs (Mantenimiento)
  tabRow: { display: 'flex', gap: 8, marginBottom: 12 },
  tab: {
    flex: 1,
    padding: '10px 14px',
    border: '1px solid #ccc',
    borderRadius: 4,
    background: '#f5f5f5',
    cursor: 'pointer'
  },
  activeTab: {
    flex: 1,
    padding: '10px 14px',
    border: '1px solid #1976d2',
    borderRadius: 4,
    background: '#1976d2',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer'
  },

  // Mensajes generales
  messageSuccess: {
    marginTop: 16,
    color: '#2e7d32',
    fontWeight: 'bold'
  },
  messageError: {
    marginTop: 16,
    color: '#d32f2f',
    fontWeight: 'bold'
  },

  // Cuadro de errores detallados
  errorBox: {
    marginTop: 16,
    padding: 12,
    border: '1px solid #d32f2f',
    borderRadius: 6,
    backgroundColor: '#ffebee',
    color: '#d32f2f',
    fontSize: '14px'
  },
  errorItem: {
    marginBottom: 6,
    paddingLeft: 8,
    borderLeft: '3px solid #d32f2f'
  },

  // Ingreso / Salida diferenciados
  ingresoBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#e8f5e9',
    border: '1px solid #2e7d32',
    color: '#2e7d32',
    fontSize: '14px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
  },
  salidaBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#e3f2fd',
    border: '1px solid #1976d2',
    color: '#1976d2',
    fontSize: '14px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
  },

  // Lista de coolers
  list: {
    listStyle: 'none',
    padding: 0,
    marginTop: 12,
    border: '1px solid #cfd8dc',
    borderRadius: 6,
    backgroundColor: '#ffffff',
    maxHeight: 250,
    overflowY: 'auto'
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    borderBottom: '1px solid #eeeeee'
  },
}