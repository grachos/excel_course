import {gradeChecks} from './grading.js';

export const pivotSource = [
  ['Región','Mes','Importe'],
  ['Norte','Enero',120], ['Norte','Febrero',180], ['Sur','Enero',90],
  ['Sur','Febrero',160], ['Centro','Enero',75], ['Centro','Febrero',125],
  ['Norte','Enero',30], ['Sur','Febrero',40]
];

const isTotal = value => ['total general','grand total','total'].includes(value);
const normalize = value => String(value ?? '').trim().toLowerCase()
  .normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/\s+/g,' ');

function valueAt(sheet, row, column) {
  const value = sheet.getCell(row,column).value;
  if (value && typeof value === 'object') {
    if (Array.isArray(value.richText)) return value.richText.map(item => item.text).join('');
    return value.result;
  }
  return value;
}

export function gradePivot(sheet, checks) {
  // Excel and Sheets can add an extra field-label row and order the categories differently.
  let header;
  for (let row = 1; row <= 6; row++) {
    const headings = Array.from({length:5}, (_,i) => normalize(valueAt(sheet,row,i+2)));
    if (headings.includes('enero') && headings.includes('febrero')) {
      header = {row, headings};
      break;
    }
  }
  const answers = {};
  if (header) {
    for (let row = header.row + 1; row <= Math.min(sheet.rowCount,header.row + 12); row++) {
      const region = normalize(valueAt(sheet,row,1));
      for (const [index, heading] of header.headings.entries()) {
        const month = isTotal(heading) ? 'total' : heading;
        const group = isTotal(region) ? 'total' : region;
        if (!group || !['enero','febrero','total'].includes(month)) continue;
        const criterion = group + ':' + month;
        // Multiple matches indicate duplicate grouped rows or columns.
        answers[criterion] = Object.hasOwn(answers,criterion) ? null : valueAt(sheet,row,index+2);
      }
    }
  }
  return gradeChecks(checks,answers);
}
