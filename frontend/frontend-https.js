import express from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// Servir la carpeta build generada por "npm run build"
app.use(express.static(path.join(path.dirname(fileURLToPath(import.meta.url)), 'build')));

// Para que React maneje el enrutado
app.get('*', (req, res) => {
  res.sendFile(path.join(path.dirname(fileURLToPath(import.meta.url)), 'build', 'index.html'));
});

// Crear servidor HTTPS usando import.meta.url
https.createServer({
  key: fs.readFileSync(new URL('../backend/192.168.0.95-key.pem', import.meta.url)),
  cert: fs.readFileSync(new URL('../backend/192.168.0.95.pem', import.meta.url))
}, app).listen(3000, () => {
  console.log('Frontend corriendo en https://192.168.0.95:3000');
});