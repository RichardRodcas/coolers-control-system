import express from 'express';
import multer from 'multer';
import path from 'path';
import equiposController from '../controllers/equiposController.js';

const router = express.Router();

// ------------------ CRUD de equipos ------------------
router.post('/equipos', equiposController.crearEquipo);
router.get('/equipos', equiposController.listarEquipos);
router.get('/equipos/:codigo', equiposController.detalleEquipo);
router.put('/equipos/:codigo', equiposController.actualizarEquipo);
router.delete('/equipos/:codigo', equiposController.eliminarEquipo);

// ------------------ Salida de equipos ------------------
router.post('/equipos/salida', equiposController.salidaEquipos);

// ------------------ Mantenimiento ------------------
router.post('/equipos/:codigo/mantenimiento', equiposController.registrarMantenimiento);
router.get('/equipos/:codigo/mantenimientos', equiposController.listarMantenimientos);

// ------------------ Fotos ------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/equipos/');
  },
  filename: (req, file, cb) => {
    const uniqueName = req.params.codigo + '_' + Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// delegamos la lógica al controller
router.post('/equipos/:codigo/foto', upload.single('foto'), equiposController.subirFoto);

// ------------------ Inventario ------------------
router.get('/equipos/inventario', equiposController.inventarioEquipos);

// ------------------ Movimientos de un equipo ------------------
router.get('/equipos/:codigo/movimientos', equiposController.movimientosEquipo);

// ------------------ Exportación en ESM ------------------
export default router;
