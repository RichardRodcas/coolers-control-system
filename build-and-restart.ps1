# Navega al frontend
cd C:\Users\Monitoreo\control-coolers\coolers-control-system\frontend

# Ejecuta el build optimizado
npm run build

# Si el build fue exitoso, reinicia el proceso en PM2
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build completado, reiniciando PM2..."
    pm2 stop coolers-frontend
    pm2 delete coolers-frontend
    pm2 start ecosystem.config.js
    pm2 status
} else {
    Write-Host "❌ Error en el build, PM2 no se reinició."
}