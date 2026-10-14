import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const archivoPG08 = path.join(
  __dirname,
  '../../docs/catalogos/PG08.xlsx'
);

const workbook = XLSX.readFile(archivoPG08);

let totalProcesados = 0;
let totalInsertados = 0;

try {

  console.log('');
  console.log('==============================');
  console.log('INICIO DE IMPORTACION');
  console.log('==============================');
  console.log('');

  for (const hoja of workbook.SheetNames) {

    console.log('');
    console.log('--------------------------------');
    console.log(`Procesando hoja: ${hoja}`);
    console.log('--------------------------------');

    const worksheet = workbook.Sheets[hoja];
    const datos = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Filas encontradas: ${datos.length}`);

    if (datos.length > 0) {
      console.log('Columnas detectadas:');
      console.log(Object.keys(datos[0]));
    }

    for (const fila of datos) {

      if (!fila['DETERMINACIÓN']) {

        console.log(
          `Fila descartada en ${hoja}:`,
          fila
        );

        continue;
      }

      totalProcesados++;

      const resultado = await pool.query(
        `
        INSERT INTO catalogo_ensayos
        (
          matriz,
          ensayo,
          frasco,
          volumen,
          preservacion,
          perecibilidad,
          cantidad_frascos
        )
        VALUES
        (
          $1,$2,$3,$4,$5,$6,$7
        )
        ON CONFLICT (matriz, ensayo)
        DO NOTHING
        RETURNING id
        `,
        [
          hoja.trim(),
          fila['DETERMINACIÓN'],
          fila['ENVASE'] || null,
          fila['CANTIDAD TIPICA DE MUESTRA'] || null,
          fila['CONSERVACIÓN'] || null,
          fila['TIEMPO MÁXIMO HASTA EL ANÁLISIS'] || null,
          Number(fila['CANTIDAD DE FRASCOS']) || 1
        ]
      );

      if (resultado.rowCount > 0) {
        totalInsertados++;
      }
    }
  }

  console.log('');
  console.log('==============================');
  console.log(`Procesados: ${totalProcesados}`);
  console.log(`Insertados: ${totalInsertados}`);
  console.log('==============================');

} catch (error) {

  console.error('');
  console.error('ERROR EN IMPORTACION');
  console.error(error);

} finally {

  await pool.end();

}