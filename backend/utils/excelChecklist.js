import XLSX from 'xlsx';

/**
 * Genera un archivo Checklist consolidado a partir de un Excel de origen.
 * @param {string} origenPath - Ruta del archivo Excel de origen (ej: backend/items.xlsx).
 * @param {string} destinoPath - Ruta donde se guardará el archivo consolidado (ej: backend/Checklist.xlsx).
 */
export function generarChecklist(origenPath, destinoPath) {
  // Leer archivo de origen
  const wb = XLSX.readFile(origenPath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws);

  // Consolidar por frasco + volumen
  const checklist = {};
  data.forEach(row => {
    const key = `${row.Frasco}-${row.Volumen}`;
    checklist[key] = (checklist[key] || 0) + row.Cantidad;
  });

  // Convertir a formato Excel
  const output = Object.entries(checklist).map(([key, total]) => {
    const [frasco, volumen] = key.split('-');
    return { Frasco: frasco, Volumen: volumen, Cantidad_Total: total };
  });

  // Crear nuevo archivo
  const newWb = XLSX.utils.book_new();
  const newWs = XLSX.utils.json_to_sheet(output);
  XLSX.utils.book_append_sheet(newWb, newWs, 'Checklist');
  XLSX.writeFile(newWb, destinoPath);
}
