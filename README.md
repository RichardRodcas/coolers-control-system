📦 README.md

# 🧊 Sistema de Control de Coolers

Aplicación Node.js + React para gestionar **ingreso, salida, mantenimiento, inventario y trazabilidad** de coolers en laboratorio y campo.

---

## 🚀 Instalación

Clona el repositorio y entra en la carpeta:

```bash
git clone https://github.com/RichardRodcas/coolers-control-system.git
cd coolers-control-system

Instala dependencias:

npm install

▶️ Uso

Backend (Express)

Ejecuta el servidor en http://localhost:4000:

node server.js

Frontend (React)

Ejecuta la aplicación en http://localhost:3000:

npm start

📦 Endpoints principales

Crear nuevo cooler

POST /coolers/nuevo

Body:

{
  "codigo": "MO-0001-TYP",
  "color": "azul",
  "estado": "operativo"
}

Ingreso de coolers

POST /coolers/ingreso

Body:

{
  "codigos": ["MO-0001-TYP", "MO-0002-TYP"]
}

Response éxito:

{
  "mensaje": "✅ Ingreso registrado para 2 cooler(s)",
  "codigos": ["MO-0001-TYP", "MO-0002-TYP"]
}

Response error:

{
  "mensaje": "No se pudo registrar el ingreso: hay coolers inválidos en la lista",
  "errores": [
    { "codigo": "MO-0003-TYP", "mensaje": "❌ Cooler no encontrado" }
  ]
}

Salida de coolers

POST /coolers/salida

Body:

{
  "codigos": ["MO-0001-TYP"],
  "cliente": "Cliente XYZ",
  "ordenTrabajo": "OT-12345"
}

Mantenimiento

PUT /coolers/:codigo/mantenimiento

Body:

{
  "estado": "observado",
  "observacion": "Puerta dañada"
}

Inventario

GET /coolers
GET /coolers/fuera

Trazabilidad

Solo historial:

GET /coolers/:codigo

Detalle completo:

GET /coolers/:codigo/detalle

📊 Ejemplo con curl

curl -X POST http://localhost:4000/coolers/nuevo \
  -H "Content-Type: application/json" \
  -d '{"codigo":"MO-0005-TYP","color":"rojo","estado":"operativo"}'

🛠️ Tecnologías

Backend: Node.js + Express

Frontend: React

Estilos: CSS-in-JS con styles.js

Icons: react-icons

API Client: Axios

👨‍💻 Autor

Proyecto desarrollado por Richard Rodríguez📍 Callao, Perú
