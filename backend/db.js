// db.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'sistema_coolers_typsa',
  password: process.env.DB_PASS || 'Password1$BD',
  port: process.env.DB_PORT || 5432,
});

export { pool };