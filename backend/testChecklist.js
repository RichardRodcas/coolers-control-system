import { generarChecklist } from './utils/excelChecklist.js';

const origen = './items.xlsx';      // tu archivo de origen
const destino = './Checklist.xlsx'; // archivo consolidado

generarChecklist(origen, destino);

console.log('Checklist generado en:', destino);
