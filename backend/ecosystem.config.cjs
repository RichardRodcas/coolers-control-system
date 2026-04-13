module.exports = {
  apps: [
    {
      name: "coolers-authserver",
      script: "authServer.js",
      cwd: "C:/Users/Monitoreo/control-coolers/coolers-control-system/backend",
      interpreter: "node",
      // ❌ node_args ya no es necesario en Node 16+ (ESM soportado nativamente)
      env: {
        AUTH_PORT: 4000,
        DB_USER: "postgres",
        DB_PASS: "Password1$BD",
        DB_HOST: "localhost",
        DB_NAME: "sistema_coolers_typsa",
        DB_PORT: 5432,
        JWT_ACCESS_SECRET: "supersecreto_access_123",
        JWT_REFRESH_SECRET: "supersecreto_refresh_456"
      }
    },
    {
      name: "coolers-server",
      script: "server.js",
      cwd: "C:/Users/Monitoreo/control-coolers/coolers-control-system/backend",
      interpreter: "node",
      env: {
        API_PORT: 5000,
        DB_USER: "postgres",
        DB_PASS: "Password1$BD",
        DB_HOST: "localhost",
        DB_NAME: "sistema_coolers_typsa",
        DB_PORT: 5432,
        JWT_ACCESS_SECRET: "supersecreto_access_123",
        JWT_REFRESH_SECRET: "supersecreto_refresh_456" // ✅ añadido para consistencia
      }
    },
    {
      name: "coolers-frontend",
      // ✅ si quieres HTTPS usa tu propio frontend-https.js
      script: "frontend-https.js",
      cwd: "C:/Users/Monitoreo/control-coolers/coolers-control-system/frontend",
      interpreter: "node",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};