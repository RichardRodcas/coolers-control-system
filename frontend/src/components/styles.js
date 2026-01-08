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

  // Botones
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
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  counterLabel: { opacity: 0.9 },
  counterColon: { margin: '0 2px', opacity: 0.6 },
  counterValue: { fontWeight: 'bold' },

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
  timelineIcon: {
    flexShrink: 0,
    fontSize: '18px'
  },
  timelineContent: {
    flex: 1,
    fontSize: '14px',
    color: '#212121'
  },

  // Tabs (Mantenimiento)
  tabRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 12
  },
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
    color: '#2e7d32',   // verde éxito
    fontWeight: 'bold'
  },
  messageError: {
    marginTop: 16,
    color: '#d32f2f',   // rojo error
    fontWeight: 'bold'
  },

  // Cuadro de errores detallados (ingreso/salida)
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
    backgroundColor: '#e8f5e9', // verde claro
    border: '1px solid #2e7d32',
    color: '#2e7d32',
    fontSize: '14px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
  },
  salidaBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#e3f2fd', // azul claro
    border: '1px solid #1976d2',
    color: '#1976d2',
    fontSize: '14px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
  },

  // 🔥 Lista de coolers mejorada
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
    borderBottom: '1px solid #eee',
    fontSize: '14px'
  },
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    color: '#d32f2f',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: '13px'
  },
  actions: {
    display: 'flex',
    gap: 12,
    marginTop: 16
  },
  feedbackHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 8
  },
  feedbackList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  feedbackItemErr: {
    backgroundColor: '#ffebee',
    border: '1px solid #d32f2f',
    borderRadius: 4,
    padding: '6px 8px',
    marginBottom: 6,
    fontSize: '13px'
  },

  // Input compacto para trazabilidad
  trazaInput: {
    width: '300px',       // más compacto
    padding: 8,
    borderRadius: 4,
    border: '1px solid #cfd8dc',
    background: 'white'
  }
};